// ─── Achievements System ──────────────────────────────────────────────────────

import type { GameStats } from "./storage";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;       // emoji
  category: "progress" | "skill" | "collection" | "social";
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Progress & Levels ──────────────────────────────────────────────────────
  {
    id: "first_blood",
    title: "First Drop",
    description: "Complete your first level",
    icon: "💧",
    category: "progress",
  },
  {
    id: "level_10",
    title: "Apprentice",
    description: "Complete 10 levels",
    icon: "🔟",
    category: "progress",
  },
  {
    id: "level_25",
    title: "Dedicated Solver",
    description: "Complete 25 levels",
    icon: "🎯",
    category: "progress",
  },
  {
    id: "level_50",
    title: "Alchemist",
    description: "Complete 50 levels",
    icon: "🏅",
    category: "progress",
  },
  {
    id: "level_100",
    title: "Century Sorter",
    description: "Complete 100 levels",
    icon: "💯",
    category: "progress",
  },
  {
    id: "level_250",
    title: "Expert Chemist",
    description: "Complete 250 levels",
    icon: "🏆",
    category: "progress",
  },
  {
    id: "level_500",
    title: "Grand Chemist",
    description: "Complete 500 levels",
    icon: "👑",
    category: "progress",
  },
  {
    id: "level_1000",
    title: "Master of Liquids",
    description: "Complete 1,000 levels",
    icon: "🌟",
    category: "progress",
  },
  {
    id: "level_2500",
    title: "Grandmaster Sorter",
    description: "Complete 2,500 levels",
    icon: "🔮",
    category: "progress",
  },
  {
    id: "level_5000",
    title: "Sage of Elements",
    description: "Complete 5,000 levels",
    icon: "⚡",
    category: "progress",
  },
  {
    id: "level_10000",
    title: "Legend of Liquid Sort",
    description: "Complete all 10,000 levels",
    icon: "🌌",
    category: "progress",
  },

  // ── Tubes Sorted Milestones ───────────────────────────────────────────────
  {
    id: "tubes_10",
    title: "First Sorting Run",
    description: "Sort 10 full tubes of matching color",
    icon: "🧪",
    category: "progress",
  },
  {
    id: "tubes_100",
    title: "Tube Specialist",
    description: "Sort 100 full tubes of matching color",
    icon: "🧪",
    category: "progress",
  },
  {
    id: "tubes_1000",
    title: "Bulk Chemist",
    description: "Sort 1,000 full tubes of matching color",
    icon: "⚗️",
    category: "progress",
  },
  {
    id: "tubes_10000",
    title: "Industrial Refining",
    description: "Sort 10,000 full tubes of matching color",
    icon: "🔬",
    category: "progress",
  },
  {
    id: "tubes_100000",
    title: "Eternal Flow",
    description: "Sort 100,000 full tubes of matching color",
    icon: "✨",
    category: "progress",
  },

  // ── Daily Streaks ──────────────────────────────────────────────────────────
  {
    id: "daily_3",
    title: "Consistent Sorter",
    description: "Maintain a 3-day play streak",
    icon: "📅",
    category: "collection",
  },
  {
    id: "daily_7",
    title: "Week Warrior",
    description: "Maintain a 7-day play streak",
    icon: "🗓️",
    category: "collection",
  },
  {
    id: "daily_30",
    title: "Monthly Devotion",
    description: "Maintain a 30-day play streak",
    icon: "🌙",
    category: "collection",
  },
  {
    id: "daily_100",
    title: "Centurion Streak",
    description: "Maintain a 100-day play streak",
    icon: "🔥",
    category: "collection",
  },
  {
    id: "daily_365",
    title: "Year of Mastery",
    description: "Maintain an epic 365-day play streak",
    icon: "☀️",
    category: "collection",
  },

  // ── Skill ─────────────────────────────────────────────────────────────────
  {
    id: "perfect_3",
    title: "Perfectionist",
    description: "Get 3 stars on any level",
    icon: "⭐",
    category: "skill",
  },
  {
    id: "perfect_10",
    title: "Star Collector",
    description: "Get 3 stars on 10 levels",
    icon: "🌟",
    category: "skill",
  },
  {
    id: "perfect_50",
    title: "All Stars",
    description: "Get 3 stars on 50 levels",
    icon: "✨",
    category: "skill",
  },
  {
    id: "no_hint",
    title: "No Hints Needed",
    description: "Complete a level without using hints",
    icon: "🧠",
    category: "skill",
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete a level in under 10 moves",
    icon: "⚡",
    category: "skill",
  },
  {
    id: "no_undo",
    title: "No Looking Back",
    description: "Complete 5 levels without using undo",
    icon: "🎲",
    category: "skill",
  },
  {
    id: "move_master",
    title: "Efficient Mind",
    description: "Complete 10 levels with minimum moves",
    icon: "🧩",
    category: "skill",
  },
  {
    id: "poured_100",
    title: "Pour Master",
    description: "Make 100 successful pours",
    icon: "🫗",
    category: "skill",
    secret: false,
  },
  {
    id: "undo_king",
    title: "Time Traveler",
    description: "Use undo 50 times",
    icon: "⏪",
    category: "skill",
    secret: true,
  },
  {
    id: "hint_hater",
    title: "Solo Genius",
    description: "Complete 20 levels in a row without hints",
    icon: "🦅",
    category: "skill",
    secret: true,
  },
];

// ─── Achievement Check Logic ──────────────────────────────────────────────────

export function checkAchievements(
  stats: GameStats,
  dailyStreak: number,
  perfectLevels: number,
  noHintThisLevel = false,
  moveCountThisLevel = Number.POSITIVE_INFINITY,
  noHintStreak = 0,
  totalTubesSorted = 0
): string[] {
  const newlyUnlocked: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition) newlyUnlocked.push(id);
  };

  // Level milestones
  check("first_blood", stats.totalLevelsCompleted >= 1);
  check("level_10",    stats.totalLevelsCompleted >= 10);
  check("level_25",    stats.totalLevelsCompleted >= 25);
  check("level_50",    stats.totalLevelsCompleted >= 50);
  check("level_100",   stats.totalLevelsCompleted >= 100);
  check("level_250",   stats.totalLevelsCompleted >= 250);
  check("level_500",   stats.totalLevelsCompleted >= 500);
  check("level_1000",  stats.totalLevelsCompleted >= 1000);
  check("level_2500",  stats.totalLevelsCompleted >= 2500);
  check("level_5000",  stats.totalLevelsCompleted >= 5000);
  check("level_10000", stats.totalLevelsCompleted >= 10000);

  // Tubes sorted
  check("tubes_10",     totalTubesSorted >= 10);
  check("tubes_100",    totalTubesSorted >= 100);
  check("tubes_1000",   totalTubesSorted >= 1000);
  check("tubes_10000",  totalTubesSorted >= 10000);
  check("tubes_100000", totalTubesSorted >= 100000);

  // Daily streak milestones
  check("daily_3",   dailyStreak >= 3);
  check("daily_7",   dailyStreak >= 7);
  check("daily_30",  dailyStreak >= 30);
  check("daily_100", dailyStreak >= 100);
  check("daily_365", dailyStreak >= 365);

  // Skills
  check("perfect_3",   perfectLevels >= 1);
  check("perfect_10",  perfectLevels >= 10);
  check("perfect_50",  perfectLevels >= 50);

  check("speed_demon", moveCountThisLevel < 10);
  check("no_hint", noHintThisLevel);
  check("no_undo", stats.totalUndosUsed >= 5 && noHintStreak >= 5);
  check("hint_hater", noHintStreak >= 20);
  check("poured_100",  stats.totalPours >= 100);
  check("undo_king",   stats.totalUndosUsed >= 50);

  return newlyUnlocked;
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(cat: Achievement["category"]): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === cat);
}

export function totalAchievements(): number {
  return ACHIEVEMENTS.length;
}
