// ─── Local Storage Persistence v2 ────────────────────────────────────────────

const KEY_PROGRESS    = "ws2_progress";
const KEY_SETTINGS    = "ws2_settings";
const KEY_DAILY       = "ws2_daily";
const KEY_ACHIEVEMENTS = "ws2_achievements";
const KEY_STATS       = "ws2_stats";
const KEY_CHESTS      = "ws2_chests";
const KEY_COSMETICS   = "ws2_cosmetics";
const KEY_CHALLENGES  = "ws2_challenges";

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface LevelProgress {
  completed: boolean;
  stars: number;        // 1–3
  bestMoves: number;
  moveCount: number;
  timeSeconds: number;
}

export interface Progress {
  maxUnlockedLevel: number;
  levels: Record<number, LevelProgress>;
}

function defaultProgress(): Progress {
  return { maxUnlockedLevel: 1, levels: {} };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY_PROGRESS);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as Progress;
  } catch { return defaultProgress(); }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(p));
}

export function completeLevel(
  levelId: number,
  moveCount: number,
  stars: number,
  timeSeconds: number,
  p: Progress
): Progress {
  const existing = p.levels[levelId];
  const updated: LevelProgress = {
    completed: true,
    stars: Math.max(existing?.stars ?? 0, stars),
    bestMoves: existing?.bestMoves ? Math.min(existing.bestMoves, moveCount) : moveCount,
    moveCount,
    timeSeconds,
  };
  const next: Progress = {
    maxUnlockedLevel: Math.max(p.maxUnlockedLevel, levelId + 1),
    levels: { ...p.levels, [levelId]: updated },
  };
  saveProgress(next);
  return next;
}

export function getTotalStars(p: Progress): number {
  return Object.values(p.levels).reduce((sum, l) => sum + (l.stars ?? 0), 0);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Settings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  darkMode: boolean;
  vibration: boolean;
  colorBlindMode: boolean;
  showTimer: boolean;
  showMoveCount: boolean;
}

function defaultSettings(): Settings {
  return {
    sfxEnabled: true,
    musicEnabled: false,
    sfxVolume: 0.7,
    musicVolume: 0.4,
    darkMode: true,
    vibration: true,
    colorBlindMode: false,
    showTimer: true,
    showMoveCount: true,
  };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch { return defaultSettings(); }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
}

// ─── Daily Reward ─────────────────────────────────────────────────────────────

export interface DailyState {
  lastClaimed: string | null; // ISO date "YYYY-MM-DD"
  streak: number;
}

export function loadDailyState(): DailyState {
  try {
    const raw = localStorage.getItem(KEY_DAILY);
    if (!raw) return { lastClaimed: null, streak: 0 };
    return JSON.parse(raw) as DailyState;
  } catch { return { lastClaimed: null, streak: 0 }; }
}

export function saveDailyState(s: DailyState): void {
  localStorage.setItem(KEY_DAILY, JSON.stringify(s));
}

export function checkDailyReward(): {
  available: boolean;
  streak: number;
} {
  const state = loadDailyState();
  const today = new Date().toISOString().split("T")[0];

  if (state.lastClaimed === today) {
    return {
      available: false,
      streak: state.streak,
    };
  }

  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  const newStreak =
    state.lastClaimed === yesterday ? state.streak + 1 : 1;

  return {
    available: true,
    streak: newStreak,
  };
}

export function claimDailyReward(): { streak: number } {
  const info = checkDailyReward();

  if (!info.available) {
    return { streak: info.streak };
  }

  const today = new Date().toISOString().split("T")[0];

  saveDailyState({
    lastClaimed: today,
    streak: info.streak,
  });

  return {
    streak: info.streak,
  };
}


// ─── Chest Rewards ────────────────────────────────────────────────────────────

export interface ChestState {
  claimedAt: number[]; // level IDs of chests already claimed
}

export interface ChestReward {
  bonusType: "hint_pack" | "skip_token" | "cosmetic";
  bonusLabel: string;
  levelId: number;
}

const CHEST_EVERY = 10; // chest at every 10th level

export function isChestLevel(levelId: number): boolean {
  return levelId > 0 && levelId % CHEST_EVERY === 0;
}

export function loadChestState(): ChestState {
  try {
    const raw = localStorage.getItem(KEY_CHESTS);
    if (!raw) return { claimedAt: [] };
    return JSON.parse(raw) as ChestState;
  } catch { return { claimedAt: [] }; }
}

export function saveChestState(s: ChestState): void {
  localStorage.setItem(KEY_CHESTS, JSON.stringify(s));
}

export function hasUnclaimedChest(levelId: number): boolean {
  if (!isChestLevel(levelId)) return false;
  const state = loadChestState();
  return !state.claimedAt.includes(levelId);
}

export function claimChest(levelId: number): ChestReward | null {
  if (!hasUnclaimedChest(levelId)) return null;

  const state = loadChestState();
  state.claimedAt.push(levelId);
  saveChestState(state);

  const extras: ChestReward["bonusType"][] = [
    "hint_pack",
    "skip_token",
    "cosmetic",
  ];

  const bonusType =
    extras[Math.floor(Math.random() * extras.length)];

  const labels: Record<ChestReward["bonusType"], string> = {
    hint_pack: "3 Free Hints",
    skip_token: "Skip Token",
    cosmetic: "Surprise Cosmetic",
  };

  return {
    bonusType,
    bonusLabel: labels[bonusType],
    levelId,
  };
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface AchievementState {
  unlocked: Record<string, boolean>;
  seen: Record<string, boolean>;
}

export function loadAchievements(): AchievementState {
  try {
    const raw = localStorage.getItem(KEY_ACHIEVEMENTS);
    if (!raw) return { unlocked: {}, seen: {} };
    return JSON.parse(raw) as AchievementState;
  } catch { return { unlocked: {}, seen: {} }; }
}

export function saveAchievements(a: AchievementState): void {
  localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(a));
}

export function unlockAchievement(id: string): boolean {
  const a = loadAchievements();
  if (a.unlocked[id]) return false;
  a.unlocked[id] = true;
  saveAchievements(a);
  return true;
}

export function markAchievementSeen(id: string): void {
  const a = loadAchievements();
  a.seen[id] = true;
  saveAchievements(a);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface GameStats {
  totalLevelsCompleted: number;
  totalMoves: number;
  totalPours: number;
  totalHintsUsed: number;
  totalUndosUsed: number;
  playTimeSeconds: number;
  perfectLevels: number;
  currentWinStreak: number;
  bestWinStreak: number;
  fastestLevel: number | null;   // seconds
  noHintStreak: number;          // consecutive levels without hints
  bestNoHintStreak: number;
}

function defaultStats(): GameStats {
  return {
    totalLevelsCompleted: 0,
    totalMoves: 0,
    totalPours: 0,
    totalHintsUsed: 0,
    totalUndosUsed: 0,
    playTimeSeconds: 0,
    perfectLevels: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    fastestLevel: null,
    noHintStreak: 0,
    bestNoHintStreak: 0,
  };
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(KEY_STATS);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch { return defaultStats(); }
}

export function saveStats(s: GameStats): void {
  localStorage.setItem(KEY_STATS, JSON.stringify(s));
}

export function updateStats(patch: Partial<GameStats>): GameStats {
  const s = loadStats();
  const next: GameStats = {
    totalLevelsCompleted: s.totalLevelsCompleted + (patch.totalLevelsCompleted ?? 0),
    totalMoves: s.totalMoves + (patch.totalMoves ?? 0),
    totalPours: s.totalPours + (patch.totalPours ?? 0),
    totalHintsUsed: s.totalHintsUsed + (patch.totalHintsUsed ?? 0),
    totalUndosUsed: s.totalUndosUsed + (patch.totalUndosUsed ?? 0),
    playTimeSeconds: s.playTimeSeconds + (patch.playTimeSeconds ?? 0),
    perfectLevels: s.perfectLevels + (patch.perfectLevels ?? 0),
    currentWinStreak: patch.currentWinStreak ?? s.currentWinStreak,
    bestWinStreak: Math.max(s.bestWinStreak, patch.bestWinStreak ?? s.bestWinStreak),
    fastestLevel: patch.fastestLevel !== undefined
      ? (s.fastestLevel === null ? patch.fastestLevel : Math.min(s.fastestLevel, patch.fastestLevel ?? Infinity))
      : s.fastestLevel,
    noHintStreak: patch.noHintStreak ?? s.noHintStreak,
    bestNoHintStreak: Math.max(s.bestNoHintStreak, patch.bestNoHintStreak ?? s.bestNoHintStreak),
  };
  saveStats(next);
  return next;
}

// ─── Cosmetics ────────────────────────────────────────────────────────────────

export type BottleSkin =
  | "classic"          // Classic Test Tube
  | "tall_lab"         // Tall Lab Tube
  | "round_flask"      // Round Flask
  | "flask"            // Erlenmeyer Flask
  | "wine_glass"       // Wine Glass
  | "martini_glass"    // Martini Glass
  | "champagne_glass"  // Champagne Glass
  | "coffee_mug"       // Coffee Mug
  | "ceramic_cup"      // Ceramic Cup
  | "soda"             // Soda Bottle
  | "glass_bottle"     // Glass Bottle
  | "potion"           // Potion Bottle
  | "jar"              // Small Jar
  | "crystal"          // Crystal Bottle
  | "gem"              // Gem Bottle
  | "hourglass"        // Hourglass
  | "vintage_bottle"   // Vintage Bottle
  | "beaker"           // Mini Beaker
  | "wide_glass"       // Wide Glass
  | "square";          // Square / Premium Crystal

export type ThemeName = "ocean" | "forest" | "sunset" | "candy" | "galaxy" | "minimal";

export interface CosmeticsState {
  unlockedBottles: BottleSkin[];
  unlockedThemes: ThemeName[];
  activeBottle: BottleSkin;
  activeTheme: ThemeName;
}

const BOTTLE_COSTS: Record<BottleSkin, number> = {
  classic: 0,
  tall_lab: 50,
  round_flask: 75,
  flask: 100,
  wine_glass: 120,
  martini_glass: 140,
  champagne_glass: 160,
  coffee_mug: 180,
  ceramic_cup: 200,
  soda: 0,
  glass_bottle: 220,
  potion: 150,
  jar: 240,
  crystal: 300,
  gem: 250,
  hourglass: 320,
  vintage_bottle: 340,
  beaker: 350,
  wide_glass: 360,
  square: 200,
};

const THEME_COSTS: Record<ThemeName, number> = {
  ocean:    0,
  forest:   150,
  sunset:   150,
  candy:    200,
  galaxy:   300,
  minimal:  100,
};

export const RARE_BOTTLE_SKINS: BottleSkin[] = [
  "tall_lab",
  "round_flask",
  "flask",
  "coffee_mug",
  "ceramic_cup",
  "glass_bottle",
  "potion",
  "jar",
  "crystal",
  "gem",
  "hourglass",
  "vintage_bottle",
  "beaker",
  "wide_glass",
  "square",
  "wine_glass",
  "martini_glass",
  "champagne_glass",
];

export function isRareBottle(id: BottleSkin): boolean {
  return RARE_BOTTLE_SKINS.includes(id);
}

export const BOTTLE_SKINS: { id: BottleSkin; label: string; desc: string; cost: number; isRare?: boolean }[] = [
  { id: "classic",          label: "Classic Test Tube",  desc: "Refined cylindrical laboratory glass tube", cost: 0 },
  { id: "soda",             label: "Soda Bottle",        desc: "Curved vintage glass soda bottle profile",   cost: 0 },
  { id: "tall_lab",         label: "Tall Lab Tube",      desc: "Elongated slender scientific test tube",     cost: 59, isRare: true },
  { id: "round_flask",      label: "Round Flask",        desc: "Spherical bulb boiling flask with lip",      cost: 59, isRare: true },
  { id: "flask",            label: "Erlenmeyer Flask",   desc: "Wide conical alchemy flask silhouette",      cost: 59, isRare: true },
  { id: "coffee_mug",       label: "Coffee Mug",         desc: "Warm ceramic cafe mug with side handle",     cost: 59, isRare: true },
  { id: "ceramic_cup",      label: "Ceramic Cup",        desc: "Minimalist Japanese glazed ceramic tumbler", cost: 59, isRare: true },
  { id: "glass_bottle",     label: "Glass Bottle",       desc: "Classic apothecary mineral water bottle",    cost: 59, isRare: true },
  { id: "potion",           label: "Potion Bottle",      desc: "Curved mystical wizard potion vial",         cost: 59, isRare: true },
  { id: "jar",              label: "Small Jar",          desc: "Wide-mouth preserves jar with glass lip",    cost: 59, isRare: true },
  { id: "crystal",          label: "Crystal Bottle",     desc: "Geometric high-refraction cut crystal",      cost: 59, isRare: true },
  { id: "gem",              label: "Gem Bottle",         desc: "Faceted gemstone prism decanter",            cost: 59, isRare: true },
  { id: "hourglass",        label: "Hourglass",          desc: "Pinched waist sands of time silhouette",     cost: 59, isRare: true },
  { id: "vintage_bottle",   label: "Vintage Bottle",     desc: "Antique rounded shoulder corked bottle",     cost: 59, isRare: true },
  { id: "beaker",           label: "Mini Beaker",        desc: "Industrial graduated laboratory beaker",     cost: 59, isRare: true },
  { id: "wide_glass",       label: "Wide Glass",         desc: "Heavy-base rocks tumbler silhouette",        cost: 59, isRare: true },
  { id: "square",           label: "Square Crystal",     desc: "Modern architectural square prism glass",    cost: 59, isRare: true },
  { id: "wine_glass",       label: "Wine Glass",         desc: "Elegant stem chalice with bowl silhouette",  cost: 59, isRare: true },
  { id: "martini_glass",    label: "Martini Glass",      desc: "V-shaped cocktail glass with sleek rim",     cost: 59, isRare: true },
  { id: "champagne_glass",  label: "Champagne Flute",    desc: "Tall slender sparkling flute silhouette",    cost: 59, isRare: true },
];

export const THEMES: { id: ThemeName; label: string; desc: string; cost: number }[] = [
  { id: "ocean",   label: "Ocean",   desc: "Cool blue depths",         cost: 0 },
  { id: "forest",  label: "Forest",  desc: "Earthy greens & moss",     cost: 0 },
  { id: "sunset",  label: "Sunset",  desc: "Warm oranges & purples",   cost: 0 },
  { id: "candy",   label: "Candy",   desc: "Sweet pastels",            cost: 0 },
  { id: "galaxy",  label: "Galaxy",  desc: "Deep space indigo",        cost: 0 },
  { id: "minimal", label: "Minimal", desc: "Clean monochrome",         cost: 0 },
];

function defaultCosmetics(): CosmeticsState {
  return {
    unlockedBottles: ["classic", "soda"],
    unlockedThemes: ["ocean", "forest"],
    activeBottle: "classic",
    activeTheme: "ocean",
  };
}

export function loadCosmetics(): CosmeticsState {
  try {
    const raw = localStorage.getItem(KEY_COSMETICS);
    if (!raw) return defaultCosmetics();
    const parsed = JSON.parse(raw);
    return {
      unlockedBottles: Array.isArray(parsed.unlockedBottles) && parsed.unlockedBottles.length > 0 
        ? parsed.unlockedBottles 
        : ["classic", "soda"],
      unlockedThemes: Array.isArray(parsed.unlockedThemes) && parsed.unlockedThemes.length > 0
        ? parsed.unlockedThemes
        : ["ocean", "forest"],
      activeBottle: parsed.activeBottle || "classic",
      activeTheme: parsed.activeTheme || "ocean",
    };
  } catch { return defaultCosmetics(); }
}

export function saveCosmetics(c: CosmeticsState): void {
  localStorage.setItem(KEY_COSMETICS, JSON.stringify(c));
}

export function unlockBottleSkin(id: BottleSkin): boolean {
  const c = loadCosmetics();
  if (c.unlockedBottles.includes(id)) return false;

  c.unlockedBottles.push(id);
  saveCosmetics(c);
  return true;
}

export function unlockTheme(id: ThemeName): boolean {
  const c = loadCosmetics();
  if (c.unlockedThemes.includes(id)) return false;

  c.unlockedThemes.push(id);
  saveCosmetics(c);
  return true;
}

export function setActiveBottle(id: BottleSkin): void {
  const c = loadCosmetics();
  if (!c.unlockedBottles.includes(id)) return;
  c.activeBottle = id;
  saveCosmetics(c);
}

export function setActiveTheme(id: ThemeName): void {
  const c = loadCosmetics();
  if (!c.unlockedThemes.includes(id)) return;
  c.activeTheme = id;
  saveCosmetics(c);
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export interface ChallengeState {
  dailyChallengeLevelId: number;
  dailyChallengeDate: string;
  dailyChallengeCompleted: boolean;
  weeklyChallengeIds: number[];
  weeklyStartDate: string;
  weeklyCompleted: number[];
  weeklyRewardClaimed: boolean;
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

function seededPick(seed: number, max: number): number {
  return ((seed * 0x9E3779B9) >>> 0) % max + 1;
}

export function loadChallenges(): ChallengeState {
  const today = new Date().toISOString().split("T")[0];
  const weekStart = getWeekStart();
  const dateSeed = parseInt(today.replace(/-/g, ""), 10);
  const weekSeed = parseInt(weekStart.replace(/-/g, ""), 10);

  // Generate daily level from date seed (51-500)
  const dailyLevelId = seededPick(dateSeed, 450) + 50;
  // Generate 7 weekly levels
  const weeklyIds = Array.from({ length: 7 }, (_, i) =>
    seededPick(weekSeed + i * 31337, 480) + 20
  );

  try {
    const raw = localStorage.getItem(KEY_CHALLENGES);
    const saved: Partial<ChallengeState> = raw ? JSON.parse(raw) : {};
    return {
      dailyChallengeLevelId: dailyLevelId,
      dailyChallengeDate: today,
      dailyChallengeCompleted: saved.dailyChallengeDate === today ? (saved.dailyChallengeCompleted ?? false) : false,
      weeklyChallengeIds: weeklyIds,
      weeklyStartDate: weekStart,
      weeklyCompleted: saved.weeklyStartDate === weekStart ? (saved.weeklyCompleted ?? []) : [],
      weeklyRewardClaimed: saved.weeklyStartDate === weekStart ? (saved.weeklyRewardClaimed ?? false) : false,
    };
  } catch {
    return {
      dailyChallengeLevelId: dailyLevelId, dailyChallengeDate: today,
      dailyChallengeCompleted: false,
      weeklyChallengeIds: weeklyIds, weeklyStartDate: weekStart,
      weeklyCompleted: [], weeklyRewardClaimed: false,
    };
  }
}

export function saveChallenges(s: ChallengeState): void {
  localStorage.setItem(KEY_CHALLENGES, JSON.stringify(s));
}

export function completeWeeklyChallenge(levelId: number): {
  allDone: boolean;
} {
  const state = loadChallenges();

  if (!state.weeklyCompleted.includes(levelId)) {
    state.weeklyCompleted.push(levelId);
  }

  const allDone = state.weeklyChallengeIds.every(
    id => state.weeklyCompleted.includes(id)
  );

  if (allDone && !state.weeklyRewardClaimed) {
    state.weeklyRewardClaimed = true;
  }

  saveChallenges(state);

  return { allDone };
}


export function completeDailyChallenge(): number {
  const state = loadChallenges();

  if (state.dailyChallengeCompleted) return 0;

  state.dailyChallengeCompleted = true;
  saveChallenges(state);

  return 1;
}
