// ─── Global Leaderboard Engine ───────────────────────────────────────────────
//
// Primary Ranking Metric: TOTAL TUBES SORTED (strictly deduped).
// Secondary Metrics: Levels Completed, Challenges Won, Daily Streak.
// Provides Global, Weekly, and All-Time leaderboards with podium treatment.

import { loadStats, loadProgress, loadDailyState, loadChallenges } from "./storage";

export type LeaderboardTab = "global" | "weekly" | "all_time";

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  avatar: string; // emoji or avatar icon id
  tubesSorted: number;
  levelsCompleted: number;
  challengesWon: number;
  country: string;
  countryCode: string;
  isCurrentPlayer?: boolean;
}

// Deterministic seed-based procedural top competitors
const BOT_NAMES = [
  { name: "AuroraSort", country: "Canada", code: "🇨🇦", avatar: "sparkles" },
  { name: "ZenAlchemist", country: "Japan", code: "🇯🇵", avatar: "test_tube" },
  { name: "LiquidPro", country: "United States", code: "🇺🇸", avatar: "crown" },
  { name: "ChromaMaster", country: "Germany", code: "🇩🇪", avatar: "flask" },
  { name: "PrismSeeker", country: "United Kingdom", code: "🇬🇧", avatar: "star" },
  { name: "AquaSorcerer", country: "France", code: "🇫🇷", avatar: "gem" },
  { name: "ColorWhiz", country: "Australia", code: "🇦🇺", avatar: "trophy" },
  { name: "ViscosityAce", country: "South Korea", code: "🇰🇷", avatar: "flame" },
  { name: "OceanicSoul", country: "Brazil", code: "🇧🇷", avatar: "droplet" },
  { name: "HydraSolver", country: "India", code: "🇮🇳", avatar: "target" },
  { name: "PureSpectrum", country: "Spain", code: "🇪🇸", avatar: "sun" },
  { name: "FlaskKnight", country: "Italy", code: "🇮🇹", avatar: "moon" },
  { name: "MeniscusMind", country: "Netherlands", code: "🇳🇱", avatar: "heart" },
  { name: "GlassWhisperer", country: "Sweden", code: "🇸🇪", avatar: "zap" },
  { name: "SolventSage", country: "Indonesia", code: "🇮🇩", avatar: "award" },
];

const KEY_PLAYER_PROFILE = "ws2_player_profile";

export interface PlayerProfile {
  name: string;
  avatar: string;
  isAccountLinked: boolean;
  linkedEmail?: string;
  totalTubesSorted: number;
  recordedTubeSignatures: string[]; // Anti-cheat: records levelId + color signature to prevent duplicate counts
  bestRank: number;
}

function defaultPlayerProfile(): PlayerProfile {
  return {
    name: "Guest Chemist",
    avatar: "droplet",
    isAccountLinked: false,
    totalTubesSorted: 0,
    recordedTubeSignatures: [],
    bestRank: 9999,
  };
}

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY_PLAYER_PROFILE);
    const p = raw ? { ...defaultPlayerProfile(), ...JSON.parse(raw) } : defaultPlayerProfile();
    const progress = loadProgress();
    const completedCount = Object.values(progress.levels).filter((l) => l.completed).length;
    if (completedCount * 3 > p.totalTubesSorted) {
      p.totalTubesSorted = completedCount * 3;
    }
    return p;
  } catch {
    return defaultPlayerProfile();
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(KEY_PLAYER_PROFILE, JSON.stringify(profile));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ws2_leaderboard_update"));
    }
  } catch {
    // Ignore
  }
}

/**
 * Record a tube completion with strict duplicate prevention.
 * Returns true if the count increased, false if already counted.
 */
export function recordTubeSorted(levelId: number, tubeSignature: string): boolean {
  const profile = loadPlayerProfile();
  const key = `${levelId}:${tubeSignature}`;

  // Strict anti-duplicate counting: each unique tube state in a level counts once
  if (profile.recordedTubeSignatures.includes(key)) {
    return false;
  }

  // Keep signature history bounded
  if (profile.recordedTubeSignatures.length > 500) {
    profile.recordedTubeSignatures = profile.recordedTubeSignatures.slice(-300);
  }

  profile.recordedTubeSignatures.push(key);
  profile.totalTubesSorted += 1;
  savePlayerProfile(profile);
  return true;
}

/**
 * Calculate dynamic percentile rank based on Total Tubes Sorted.
 */
export function calculatePlayerRank(tubesSorted: number): number {
  if (tubesSorted >= 15000) return Math.max(1, 15 - Math.floor((tubesSorted - 15000) / 1000));
  if (tubesSorted >= 8000) return Math.max(16, 50 - Math.floor((tubesSorted - 8000) / 200));
  if (tubesSorted >= 4000) return Math.max(51, 150 - Math.floor((tubesSorted - 4000) / 50));
  if (tubesSorted >= 1500) return Math.max(151, 500 - Math.floor((tubesSorted - 1500) / 10));
  if (tubesSorted >= 500) return Math.max(501, 1500 - Math.floor((tubesSorted - 500) / 2));
  if (tubesSorted >= 100) return Math.max(1501, 4500 - Math.floor((tubesSorted - 100) * 8));
  return Math.max(2500, 8500 - tubesSorted * 35);
}

export function getLeaderboardEntries(tab: LeaderboardTab): {
  entries: LeaderboardEntry[];
  playerRank: number;
  newBestRank: boolean;
} {
  const profile = loadPlayerProfile();
  const progress = loadProgress();
  const challenges = loadChallenges();
  const daily = loadDailyState();

  const completedLevelCount = Object.values(progress.levels).filter((l) => l.completed).length;
  const tubesSorted = Math.max(profile.totalTubesSorted, completedLevelCount * 3);

  // Time-based variation for Weekly vs All Time
  const multiplier = tab === "weekly" ? 0.35 : tab === "global" ? 0.8 : 1.0;

  const currentRank = calculatePlayerRank(tubesSorted);
  const isNewBest = currentRank < profile.bestRank;

  if (isNewBest) {
    profile.bestRank = currentRank;
    savePlayerProfile(profile);
  }

  // Base scores for top competitors
  const baseTubes = tab === "weekly" ? [2400, 2150, 1890, 1620, 1450] : [18450, 17200, 16100, 14800, 13900];

  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < BOT_NAMES.length; i++) {
    const bot = BOT_NAMES[i];
    const topScore = baseTubes[i] ?? Math.floor((baseTubes[4] ?? 10000) * (1 - (i - 4) * 0.05));
    entries.push({
      rank: i + 1,
      playerId: `bot_${i}`,
      name: bot.name,
      avatar: bot.avatar,
      tubesSorted: Math.floor(topScore * multiplier),
      levelsCompleted: Math.floor((topScore / 3.8) * multiplier),
      challengesWon: Math.floor((topScore / 25) * multiplier),
      country: bot.country,
      countryCode: bot.code,
    });
  }

  // Inject current player into the list at their rank
  const playerEntry: LeaderboardEntry = {
    rank: currentRank,
    playerId: "current_player",
    name: profile.name,
    avatar: profile.avatar,
    tubesSorted,
    levelsCompleted: completedLevelCount,
    challengesWon: (challenges.weeklyCompleted?.length ?? 0) + (challenges.dailyChallengeCompleted ? 1 : 0),
    country: "Your Region",
    countryCode: "📍",
    isCurrentPlayer: true,
  };

  // If player is in top 15, replace or place directly
  if (currentRank <= entries.length) {
    entries.splice(currentRank - 1, 0, playerEntry);
    // Re-index ranks
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });
  } else {
    // Append player at the end as "You"
    entries.push(playerEntry);
  }

  return {
    entries: entries.slice(0, 20),
    playerRank: currentRank,
    newBestRank: isNewBest,
  };
}
