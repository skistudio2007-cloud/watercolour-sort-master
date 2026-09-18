// ─── 10,000 Deterministic Solvable Level Engine ──────────────────────────────
//
// Every level is generated on-demand using a deterministic seeded PRNG.
// Levels are generated via reverse legal moves from a completed state,
// guaranteeing that 100% of all 10,000 levels are mathematically solvable.
// An LRU cache preserves recent levels in memory without loading all 10,000.

import type { Color } from "./gameLogic";
import { TUBE_CAPACITY } from "./gameLogic";

export const TOTAL_LEVELS = 10000;

export type Difficulty =
  | "tutorial"
  | "easy"
  | "medium"
  | "hard"
  | "superhard"
  | "veryhard"
  | "expert"
  | "master";

export interface LevelDefinition {
  id: number;
  tubes: Color[][]; // bottom to top
  numColors: number;
  numTubes: number;
  emptyTubes: number;
  difficulty: Difficulty;
  parMoves: number;
  isMilestone: boolean;
  milestoneTitle?: string;
  isSuperHard?: boolean;
}

export const ALL_COLORS: Color[] = [
  "red",
  "blue",
  "yellow",
  "green",
  "orange",
  "purple",
  "cyan",
  "pink",
  "lime",
  "amber",
  "teal",
  "indigo",
  "magenta",
  "coral",
  "emerald",
  "violet",
  "sky",
  "rose",
  "brown",
  "olive",
];

export function isMilestoneLevel(levelId: number): boolean {
  return levelId % 10 === 0;
}

export function isSuperHardLevel(levelId: number): boolean {
  return levelId % 50 === 0;
}

export function getMilestoneTitle(levelId: number): string {
  if (levelId % 50 === 0) {
    switch (levelId) {
      case 50:    return "★ SUPER HARD: Chromatic Titan ★";
      case 100:   return "★ SUPER HARD: Centurion Overlord ★";
      case 250:   return "★ SUPER HARD: Prismatic Demiurge ★";
      case 500:   return "★ SUPER HARD: Liquid Grandmaster ★";
      case 1000:  return "★ SUPER HARD: Millennium Apex ★";
      case 2500:  return "★ SUPER HARD: Master of Viscosity ★";
      case 5000:  return "★ SUPER HARD: Halfway to Infinity ★";
      case 7500:  return "★ SUPER HARD: Astral Alchemist ★";
      case 10000: return "★ ULTIMATE APEX: Eternal Zenith Master ★";
      default:    return `★ SUPER HARD: Level ${levelId} Boss ★`;
    }
  }

  // Every 10th level (10, 20, 30, 40, 60...)
  switch (levelId) {
    case 10:    return "Hard Challenge: Apprentice Sort";
    case 20:    return "Hard Challenge: Novice Alchemist";
    case 30:    return "Hard Challenge: Chromatic Trial";
    case 40:    return "Hard Challenge: Labyrinth Flow";
    case 60:    return "Hard Challenge: Tangled Waters";
    case 70:    return "Hard Challenge: Viscous Crucible";
    case 80:    return "Hard Challenge: Prism Spark";
    case 90:    return "Hard Challenge: Alchemical Gate";
    default:    return `Hard Challenge: Level ${levelId}`;
  }
}

interface GenConfig {
  numColors: number;
  emptyTubes: number;
  difficulty: Difficulty;
  parMoves: number;
  scrambleMoves: number;
}

export function getLevelConfig(levelId: number): GenConfig {
  const isSuperHard = levelId % 50 === 0;
  const isEvery10th = levelId % 10 === 0;

  // 1–9: Engaging Tutorial & Quick Learn
  if (levelId <= 2) {
    return { numColors: 3, emptyTubes: 2, difficulty: "tutorial", parMoves: 8, scrambleMoves: 18 + levelId * 2 };
  }
  if (levelId < 10) {
    return { numColors: 4, emptyTubes: 2, difficulty: "tutorial", parMoves: 14, scrambleMoves: 38 + levelId * 2 };
  }

  // ── 1. SUPER HARD BOSS LEVELS (50, 100, 150, 200, 250, 500 ... 10,000) ──
  if (isSuperHard) {
    if (levelId === 50) {
      return { numColors: 9, emptyTubes: 2, difficulty: "superhard", parMoves: 44, scrambleMoves: 110 };
    }
    if (levelId === 100) {
      return { numColors: 11, emptyTubes: 2, difficulty: "superhard", parMoves: 56, scrambleMoves: 145 };
    }
    if (levelId <= 500) {
      return { numColors: 13, emptyTubes: 2, difficulty: "superhard", parMoves: 68, scrambleMoves: 180 };
    }
    if (levelId <= 2500) {
      return { numColors: 15, emptyTubes: 2, difficulty: "superhard", parMoves: 85, scrambleMoves: 220 };
    }
    return {
      numColors: 16,
      emptyTubes: 2,
      difficulty: "superhard",
      parMoves: 105,
      scrambleMoves: 260,
    };
  }

  // ── 2. HARD CHALLENGE LEVELS (10, 20, 30, 40, 60, 70, 80, 90 ... 9,990) ──
  if (isEvery10th) {
    if (levelId === 10) {
      return { numColors: 5, emptyTubes: 2, difficulty: "hard", parMoves: 22, scrambleMoves: 64 };
    }
    if (levelId === 20) {
      return { numColors: 6, emptyTubes: 2, difficulty: "hard", parMoves: 28, scrambleMoves: 80 };
    }
    if (levelId <= 40) {
      return { numColors: 7, emptyTubes: 2, difficulty: "hard", parMoves: 34, scrambleMoves: 95 };
    }
    if (levelId <= 90) {
      return { numColors: 8, emptyTubes: 2, difficulty: "hard", parMoves: 40, scrambleMoves: 110 };
    }
    if (levelId <= 300) {
      return { numColors: 10, emptyTubes: 2, difficulty: "hard", parMoves: 50, scrambleMoves: 135 };
    }
    if (levelId <= 1500) {
      return { numColors: 12, emptyTubes: 2, difficulty: "hard", parMoves: 64, scrambleMoves: 165 };
    }
    if (levelId <= 4000) {
      return { numColors: 14, emptyTubes: 2, difficulty: "hard", parMoves: 78, scrambleMoves: 195 };
    }
    return {
      numColors: 15,
      emptyTubes: 2,
      difficulty: "hard",
      parMoves: 92,
      scrambleMoves: 240,
    };
  }

  // ── 3. STANDARD PROGRESSIVE LEVELS (Made deeper & more engaging than previous) ──
  if (levelId < 20) {
    return { numColors: 4, emptyTubes: 2, difficulty: "easy", parMoves: 16, scrambleMoves: 44 + levelId * 2 };
  }
  if (levelId <= 40) {
    return { numColors: 5, emptyTubes: 2, difficulty: "easy", parMoves: 20, scrambleMoves: 54 + (levelId % 10) * 2 };
  }
  if (levelId <= 80) {
    return { numColors: 6, emptyTubes: 2, difficulty: "medium", parMoves: 26, scrambleMoves: 68 + (levelId % 15) * 2 };
  }
  if (levelId <= 150) {
    return { numColors: 7, emptyTubes: 2, difficulty: "medium", parMoves: 32, scrambleMoves: 78 + (levelId % 20) * 2 };
  }
  if (levelId <= 300) {
    return { numColors: 8, emptyTubes: 2, difficulty: "medium", parMoves: 38, scrambleMoves: 88 + (levelId % 25) * 2 };
  }
  if (levelId <= 600) {
    return { numColors: 9, emptyTubes: 2, difficulty: "medium", parMoves: 44, scrambleMoves: 98 + (levelId % 30) * 2 };
  }
  if (levelId <= 1200) {
    return { numColors: 10, emptyTubes: 2, difficulty: "veryhard", parMoves: 52, scrambleMoves: 115 + (levelId % 40) * 2 };
  }
  if (levelId <= 2500) {
    return { numColors: 11, emptyTubes: 2, difficulty: "veryhard", parMoves: 60, scrambleMoves: 130 + (levelId % 50) * 2 };
  }
  if (levelId <= 5000) {
    return { numColors: 13, emptyTubes: 2, difficulty: "expert", parMoves: 72, scrambleMoves: 160 + (levelId % 70) * 2 };
  }
  return {
    numColors: Math.min(15, 13 + (levelId % 3)),
    emptyTubes: 2,
    difficulty: "master",
    parMoves: 86 + (levelId % 20),
    scrambleMoves: 210 + (levelId % 100) * 2,
  };
}



// ─── Fast Seeded PRNG (Mulberry32) ────────────────────────────────────────────

function makeRng(seed: number) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function topGroup(tube: Color[]): number {
  if (tube.length === 0) return 0;
  const color = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0 && tube[i] === color; i--) count++;
  return count;
}

// ─── Fast BFS Solvability Verifier ────────────────────────────────────────────

export function isBoardSolvable(tubes: Color[][], maxSteps = 15000): boolean {
  const isComplete = (state: Color[][]) =>
    state.every((t) => t.length === 0 || (t.length === TUBE_CAPACITY && t.every((c) => c === t[0])));

  if (isComplete(tubes)) return true;

  const key = (state: Color[][]) => state.map((t) => t.join(",")).sort().join("|");
  const queue: Color[][][] = [tubes];
  const visited = new Set<string>();
  visited.add(key(tubes));

  let steps = 0;
  while (queue.length > 0 && steps < maxSteps) {
    steps++;
    const state = queue.shift()!;
    if (isComplete(state)) return true;

    for (let i = 0; i < state.length; i++) {
      const from = state[i];
      if (from.length === 0) continue;
      if (from.length === TUBE_CAPACITY && from.every((c) => c === from[0])) continue;

      const fromColor = from[from.length - 1];

      for (let j = 0; j < state.length; j++) {
        if (i === j) continue;
        const to = state[j];
        if (to.length >= TUBE_CAPACITY) continue;
        const toTop = to.length > 0 ? to[to.length - 1] : null;

        if (toTop === null || toTop === fromColor) {
          if (to.length === 0 && from.every((c) => c === from[0])) continue;

          const next: Color[][] = state.map((t) => [...t]);
          const nFrom = next[i];
          const nTo = next[j];
          while (nFrom.length > 0 && nFrom[nFrom.length - 1] === fromColor && nTo.length < TUBE_CAPACITY) {
            nTo.push(nFrom.pop()!);
          }

          const k = key(next);
          if (!visited.has(k)) {
            visited.add(k);
            queue.push(next);
          }
        }
      }
    }
  }

  return false;
}

// ─── Procedural Solvable Board Generation ──────────────────────────────────────

function generateSolvableTubes(levelId: number, config: GenConfig): Color[][] {
  for (let attempt = 0; attempt < 50; attempt++) {
    const rng = makeRng(levelId * 2654435761 + 1013904223 + attempt * 7919);

    // Pick colors for this level deterministically
    const colorPool = [...ALL_COLORS];
    for (let i = colorPool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
    }
    const chosenColors = colorPool.slice(0, config.numColors);

    // Initialize solved tubes (each color full in its own tube)
    const tubes: Color[][] = [];
    for (let i = 0; i < config.numColors; i++) {
      tubes.push(Array(TUBE_CAPACITY).fill(chosenColors[i]));
    }
    // Add empty workspace tubes
    for (let i = 0; i < config.emptyTubes; i++) {
      tubes.push([]);
    }

    // Reverse Scramble
    let prevSource = -1;
    let prevTarget = -1;

    for (let step = 0; step < config.scrambleMoves; step++) {
      const moves: { from: number; to: number; count: number; weight: number }[] = [];

      for (let from = 0; from < tubes.length; from++) {
        if (tubes[from].length === 0) continue;
        const amount = topGroup(tubes[from]);
        if (amount === 0) continue;

        for (let to = 0; to < tubes.length; to++) {
          if (from === to) continue;
          if (from === prevTarget && to === prevSource) continue;

          const space = TUBE_CAPACITY - tubes[to].length;
          if (space <= 0) continue;

          const maxMoved = Math.min(amount, space);
          for (let m = 1; m <= maxMoved; m++) {
            let weight = 10;
            if (tubes[to].length > 0) weight += 15;
            const emptyCount = tubes.filter((t) => t.length === 0).length;
            if (emptyCount === 1 && tubes[to].length === 0 && tubes[from].length > m) {
              weight = 2;
            }
            moves.push({ from, to, count: m, weight });
          }
        }
      }

      if (moves.length === 0) break;

      const totalWeight = moves.reduce((sum, m) => sum + m.weight, 0);
      let randVal = rng() * totalWeight;
      let chosen = moves[moves.length - 1];

      for (const move of moves) {
        randVal -= move.weight;
        if (randVal <= 0) {
          chosen = move;
          break;
        }
      }

      const color = tubes[chosen.from][tubes[chosen.from].length - 1];
      for (let c = 0; c < chosen.count; c++) {
        if (tubes[chosen.from].length === 0 || tubes[chosen.to].length >= TUBE_CAPACITY) break;
        tubes[chosen.from].pop();
        tubes[chosen.to].push(color);
      }

      prevSource = chosen.from;
      prevTarget = chosen.to;
    }

    // Deterministically shuffle the tube order on screen
    for (let i = tubes.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [tubes[i], tubes[j]] = [tubes[j], tubes[i]];
    }

    // STRICT VALIDATION: Guarantee NO tube starts already complete (4 identical colors)
    const hasPreSolvedTube = tubes.some(
      (t) => t.length === TUBE_CAPACITY && t.every((c) => c === t[0])
    );
    const emptyCount = tubes.filter((t) => t.length === 0).length;

    // Must have required empty tubes, no pre-solved tubes, and proven solvable by BFS
    if (!hasPreSolvedTube && emptyCount >= config.emptyTubes) {
      if (isBoardSolvable(tubes)) {
        return tubes.map((t) => [...t]);
      }
    }
  }

  // Fallback safe guarantee: Circular shift ensuring ZERO pre-solved tubes across all colored bottles
  const tubes: Color[][] = [];
  const chosenColors = ALL_COLORS.slice(0, config.numColors);
  for (let i = 0; i < config.numColors; i++) {
    tubes.push(Array(TUBE_CAPACITY).fill(chosenColors[i]));
  }
  for (let i = 0; i < config.emptyTubes; i++) {
    tubes.push([]);
  }
  // Circularly shift 1 top block across ALL colored tubes so NO tube is ever pre-solved
  const popped = tubes.slice(0, config.numColors).map((t) => t.pop()!);
  for (let i = 0; i < config.numColors; i++) {
    const nextIdx = (i + 1) % config.numColors;
    tubes[nextIdx].push(popped[i]);
  }
  return tubes.map((t) => [...t]);
}

// ─── LRU Cache for On-Demand Level Retrieval ──────────────────────────────────

const LEVEL_CACHE = new Map<number, LevelDefinition>();
const MAX_CACHE_SIZE = 40;

export function getLevel(levelId: number): LevelDefinition {
  const safeId = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(levelId)));

  if (LEVEL_CACHE.has(safeId)) {
    const cached = LEVEL_CACHE.get(safeId)!;
    // Reinsert to refresh LRU order
    LEVEL_CACHE.delete(safeId);
    LEVEL_CACHE.set(safeId, cached);
    return cached;
  }

  const config = getLevelConfig(safeId);
  const tubes = generateSolvableTubes(safeId, config);
  const isMilestone = isMilestoneLevel(safeId);
  const isSuperHard = isSuperHardLevel(safeId);

  const def: LevelDefinition = {
    id: safeId,
    tubes,
    numColors: config.numColors,
    numTubes: tubes.length,
    emptyTubes: tubes.filter((t) => t.length === 0).length,
    difficulty: config.difficulty,
    parMoves: config.parMoves,
    isMilestone,
    milestoneTitle: (isMilestone || isSuperHard) ? getMilestoneTitle(safeId) : undefined,
    isSuperHard,
  };

  if (LEVEL_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = LEVEL_CACHE.keys().next().value;
    if (firstKey !== undefined) LEVEL_CACHE.delete(firstKey);
  }

  LEVEL_CACHE.set(safeId, def);
  return def;
}

export function getLevelDifficulty(levelId: number): Difficulty {
  return getLevelConfig(Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(levelId)))).difficulty;
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  switch (difficulty) {
    case "tutorial": return "Tutorial";
    case "easy":     return "Easy";
    case "medium":   return "Medium";
    case "hard":     return "Hard";
    case "superhard": return "Super Hard";
    case "veryhard": return "Very Hard";
    case "expert":   return "Expert";
    case "master":   return "Master";
  }
}

export function getDifficultyColor(difficulty: Difficulty | string): string {
  switch (difficulty) {
    case "tutorial": return "#06B6D4"; // Cyan
    case "easy":     return "#10B981"; // Emerald
    case "medium":   return "#F59E0B"; // Amber
    case "hard":     return "#EF4444"; // Red
    case "superhard": return "#7C3AED"; // Vivid Royal Violet
    case "veryhard": return "#A855F7"; // Purple
    case "expert":   return "#EC4899"; // Pink
    case "master":   return "#EAB308"; // Gold
    default:         return "#6B7280";
  }
}

export function calcStars(parMoves: number, moveCount: number): number {
  if (moveCount <= parMoves) return 3;
  if (moveCount <= Math.floor(parMoves * 1.5)) return 2;
  return 1;
}

export function getChapterName(chapterIndex: number): string {
  const names = [
    "The Basics",
    "Color Theory",
    "Chromatic Fluidity",
    "Tangled Hues",
    "Deep Waters",
    "Prismatic Flow",
    "The Crystal Lab",
    "Alchemical Currents",
    "Abyss of Hues",
    "The Master's Vault",
    "Nebula Stream",
    "Prism of Eternity",
  ];
  return names[(chapterIndex - 1) % names.length] || `Chapter ${chapterIndex}`;
}