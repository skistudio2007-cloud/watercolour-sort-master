// ─── Core Water Sort Game Engine v3 ─────────────────────────────────────────

export type Color =
  | "red" | "blue" | "green" | "yellow" | "orange" | "purple"
  | "pink" | "cyan" | "lime" | "brown" | "teal" | "indigo"
  | "magenta" | "olive" | "coral" | "sky" | "rose" | "amber"
  | "emerald" | "violet";

export const COLOR_HEX: Record<Color, string> = {
  red:     "#E05252", // Soothing Rich Crimson Coral
  blue:    "#3B82F6", // Calm Sapphire Ocean Blue
  yellow:  "#EAB308", // Warm Golden Amber Sunflower
  green:   "#10B981", // Fresh Calming Mint Jade
  orange:  "#F97316", // Warm Sweet Papaya Orange
  purple:  "#9333EA", // Elegant Royal Plum Violet
  pink:    "#EC4899", // Soft Rose Petal Pink
  cyan:    "#06B6D4", // Clear Azure Lagoon Cyan
  lime:    "#84CC16", // Gentle Crisp Kiwi Green
  amber:   "#D97706", // Deep Honey Caramel
  teal:    "#0D9488", // Serene Deep Ocean Teal
  indigo:  "#4F46E5", // Deep Velvet Twilight Indigo
  magenta: "#C026D3", // Soft Orchid Magenta
  coral:   "#FB7185", // Delicate Sunset Coral
  emerald: "#059669", // Deep Pine Forest Emerald
  violet:  "#7C3AED", // Mellow Wisteria Violet
  sky:     "#38BDF8", // Gentle Morning Sky Blue
  rose:    "#E11D48", // Velvety Crimson Rose
  brown:   "#92400E", // Warm Cedar Bark Brown
  olive:   "#65A30D", // Relaxing Herbal Olive
};

export const COLOR_GRADIENT: Record<Color, [string, string]> = {
  red:     ["#F87171", "#DC2626"],
  blue:    ["#60A5FA", "#2563EB"],
  yellow:  ["#FDE047", "#CA8A04"],
  green:   ["#34D399", "#059669"],
  orange:  ["#FB923C", "#EA580C"],
  purple:  ["#A855F7", "#7E22CE"],
  pink:    ["#F472B6", "#DB2777"],
  cyan:    ["#38BDF8", "#0891B2"],
  lime:    ["#A3E635", "#65A30D"],
  amber:   ["#FBBF24", "#B45309"],
  teal:    ["#2DD4BF", "#0F766E"],
  indigo:  ["#818CF8", "#4338CA"],
  magenta: ["#E879F9", "#A21CAF"],
  coral:   ["#FDA4AF", "#E11D48"],
  emerald: ["#34D399", "#047857"],
  violet:  ["#A78BFA", "#6D28D9"],
  sky:     ["#7DD3FC", "#0284C7"],
  rose:    ["#FB7185", "#BE123C"],
  brown:   ["#B45309", "#78350F"],
  olive:   ["#A3E635", "#4D7C0F"],
};

// Accessibility Symbols for Colorblind Support
export const COLOR_SYMBOLS: Record<Color, string> = {
  red:     "●", // Circle
  blue:    "▲", // Triangle
  green:   "■", // Square
  yellow:  "★", // Star
  orange:  "◆", // Diamond
  purple:  "✦", // Sparkle
  pink:    "♥", // Heart
  cyan:    "❖", // Cross Diamond
  lime:    "✚", // Plus
  brown:   "⬢", // Hexagon
  teal:    "◈", // Inset Diamond
  indigo:  "▼", // Inverted Triangle
  magenta: "☼", // Sun
  olive:   "⬡", // Outline Hexagon
  coral:   "✖", // Cross
  sky:     "☁", // Cloud
  rose:    "❋", // Flower
  amber:   "✪", // Circle Star
  emerald: "☘", // Clover
  violet:  "✧", // Small Sparkle
};

export const TUBE_CAPACITY = 4;

export interface Tube {
  id: number;
  colors: Color[]; // bottom to top
}

export interface PourAnimationState {
  from: number;
  to: number;
  color: Color;
  amount: number;
}

export interface GameState {
  tubes: Tube[];
  moveCount: number;
  history: Tube[][];
  selectedTube: number | null;
  invalidTube: number | null;
  isComplete: boolean;
  levelId: number;
  pourAnimating: PourAnimationState | null;
}

// ─── Tube Query Helpers ───────────────────────────────────────────────────────

export function tubeTopColor(tube: Tube): Color | null {
  return tube.colors.length > 0 ? tube.colors[tube.colors.length - 1] : null;
}

export function tubeIsFull(tube: Tube): boolean {
  return tube.colors.length >= TUBE_CAPACITY;
}

export function tubeIsEmpty(tube: Tube): boolean {
  return tube.colors.length === 0;
}

export function tubeIsComplete(tube: Tube): boolean {
  if (tube.colors.length === 0) return true;
  if (tube.colors.length !== TUBE_CAPACITY) return false;
  return tube.colors.every((c) => c === tube.colors[0]);
}

export function pourableCount(tube: Tube): number {
  if (tube.colors.length === 0) return 0;
  const top = tubeTopColor(tube)!;
  let count = 0;
  for (let i = tube.colors.length - 1; i >= 0; i--) {
    if (tube.colors[i] === top) count++;
    else break;
  }
  return count;
}

export function canPour(from: Tube, to: Tube): boolean {
  if (tubeIsEmpty(from)) return false;
  if (tubeIsFull(to)) return false;
  // Never pour out of an already complete single-color full tube
  if (tubeIsComplete(from)) return false;

  const fromTop = tubeTopColor(from)!;
  const toTop = tubeTopColor(to);

  // Can pour into empty tube OR onto matching top color
  return toTop === null || toTop === fromTop;
}

// ─── Move Execution with Deep Integrity ──────────────────────────────────────

export function pourWater(
  state: GameState,
  fromIdx: number,
  toIdx: number
): GameState | null {
  const from = state.tubes[fromIdx];
  const to = state.tubes[toIdx];
  if (!canPour(from, to)) return null;

  const newTubes: Tube[] = state.tubes.map((t) => ({ ...t, colors: [...t.colors] }));
  const newFrom = newTubes[fromIdx];
  const newTo = newTubes[toIdx];

  const color = tubeTopColor(newFrom)!;
  const spacesInTo = TUBE_CAPACITY - newTo.colors.length;
  const availableFromTop = pourableCount(newFrom);
  const amount = Math.min(spacesInTo, availableFromTop);

  for (let i = 0; i < amount; i++) {
    newFrom.colors.pop();
    newTo.colors.push(color);
  }

  // Level completes when all non-empty tubes are complete
  const isComplete = newTubes.every(tubeIsComplete);

  return {
    ...state,
    tubes: newTubes,
    moveCount: state.moveCount + 1,
    history: [...state.history, state.tubes.map((t) => ({ ...t, colors: [...t.colors] }))],
    selectedTube: null,
    invalidTube: null,
    isComplete,
    pourAnimating: {
      from: fromIdx,
      to: toIdx,
      color,
      amount,
    },
  };
}

export function clearPourAnimation(state: GameState): GameState {
  return { ...state, pourAnimating: null };
}

export function undoMove(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    ...state,
    tubes: prev.map((t) => ({ ...t, colors: [...t.colors] })),
    moveCount: Math.max(0, state.moveCount - 1),
    history: state.history.slice(0, -1),
    selectedTube: null,
    invalidTube: null,
    isComplete: false,
    pourAnimating: null,
  };
}

export function selectTube(state: GameState, idx: number): GameState {
  if (state.pourAnimating !== null) {
    // Locked during animation
    return state;
  }

  const tube = state.tubes[idx];

  // No tube selected yet
  if (state.selectedTube === null) {
    if (tubeIsEmpty(tube) || tubeIsComplete(tube)) {
      // Gentle reject on empty/complete tube
      return { ...state, invalidTube: idx };
    }
    return { ...state, selectedTube: idx, invalidTube: null };
  }

  // Clicked the same tube -> deselect
  if (state.selectedTube === idx) {
    return { ...state, selectedTube: null, invalidTube: null };
  }

  // Try to pour from selected -> target
  const poured = pourWater(state, state.selectedTube, idx);
  if (poured) return poured;

  // Invalid pour:
  // If target has content and is not complete, switch selection to it
  if (!tubeIsEmpty(tube) && !tubeIsComplete(tube)) {
    return { ...state, selectedTube: idx, invalidTube: null };
  }

  // Otherwise show gentle rejection shake on the target tube
  return { ...state, selectedTube: state.selectedTube, invalidTube: idx };
}

// ─── Deadlock / Stuck Check ───────────────────────────────────────────────────

export function isStuck(state: GameState): boolean {
  if (state.isComplete) return false;
  const { tubes } = state;
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i !== j && canPour(tubes[i], tubes[j])) return false;
    }
  }
  return true;
}

// ─── Smart Hint Engine ────────────────────────────────────────────────────────

export interface HintMove {
  from: number;
  to: number;
}

function scoreHint(tubes: Tube[], from: number, to: number): number {
  const f = tubes[from];
  const t = tubes[to];
  if (!canPour(f, t)) return -1;

  const fColors = [...f.colors];
  const tColors = [...t.colors];
  const color = fColors[fColors.length - 1];
  let moved = 0;

  while (
    fColors.length > 0 &&
    fColors[fColors.length - 1] === color &&
    tColors.length < TUBE_CAPACITY
  ) {
    tColors.push(fColors.pop()!);
    moved++;
  }

  // Move completes destination tube
  if (tColors.length === TUBE_CAPACITY && tColors.every((c) => c === tColors[0])) return 10;
  // Move clears source and completes it
  if (fColors.length > 0 && fColors.every((c) => c === fColors[0])) return 8;
  // Consolidating onto non-empty matching tube
  if (tubes[to].colors.length > 0) return 6;
  // Pouring into empty to uncover a useful color
  if (fColors.length > 0 && fColors[fColors.length - 1] !== color) return 4;
  return 2;
}

export function findHint(state: GameState): HintMove | null {
  const { tubes } = state;
  let best: { score: number; from: number; to: number } | null = null;

  for (let from = 0; from < tubes.length; from++) {
    for (let to = 0; to < tubes.length; to++) {
      if (from === to) continue;
      const score = scoreHint(tubes, from, to);
      if (score < 0) continue;
      if (!best || score > best.score) {
        best = { score, from, to };
      }
    }
  }

  return best ? { from: best.from, to: best.to } : null;
}

// ─── Initialization ───────────────────────────────────────────────────────────

export function initGameState(levelId: number, tubes: Color[][]): GameState {
  return {
    tubes: tubes.map((colors, id) => ({ id, colors: [...colors] })),
    moveCount: 0,
    history: [],
    selectedTube: null,
    invalidTube: null,
    isComplete: false,
    levelId,
    pourAnimating: null,
  };
}

export function solvedTubeCount(state: GameState): number {
  return state.tubes.filter((t) => t.colors.length > 0 && tubeIsComplete(t)).length;
}