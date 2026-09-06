// ─── Core Water Sort Game Engine v3 ─────────────────────────────────────────

export type Color =
  | "red" | "blue" | "green" | "yellow" | "orange" | "purple"
  | "pink" | "cyan" | "lime" | "brown" | "teal" | "indigo"
  | "magenta" | "olive" | "coral" | "sky" | "rose" | "amber"
  | "emerald" | "violet";

export const COLOR_HEX: Record<Color, string> = {
  orange:  "#F26B3A", // Orange
  yellow:  "#E8B83A", // Yellow
  red:     "#C94B68", // Crimson
  pink:    "#D95AAE", // Pink
  purple:  "#8B63C7", // Purple
  blue:    "#3F73C9", // Blue
  sky:     "#4CA8C1", // Sky Blue
  teal:    "#42AFA0", // Turquoise
  green:   "#65B64A", // Green
  coral:   "#E9826D", // Coral
  cyan:    "#38A3A5", // Deep Cyan
  lime:    "#7CB518", // Soft Lime
  magenta: "#C05299", // Soft Magenta
  amber:   "#D48B38", // Rich Amber
  emerald: "#2D936C", // Deep Emerald
  violet:  "#6E5494", // Elegant Violet
  rose:    "#BD4057", // Deep Rose
  indigo:  "#4A69BD", // Soft Indigo
  brown:   "#8D6E63", // Warm Sienna Brown
  olive:   "#606C38", // Earth Olive
};

export const COLOR_GRADIENT: Record<Color, [string, string]> = {
  orange:  ["#F57D4F", "#D95624"],
  yellow:  ["#ECC455", "#CFA026"],
  red:     ["#D45D78", "#AF3953"],
  pink:    ["#E06EBA", "#BE4693"],
  purple:  ["#9A75D4", "#774FB5"],
  blue:    ["#5185D9", "#2E5EAF"],
  sky:     ["#5EB6CE", "#3D94AB"],
  teal:    ["#52BDAE", "#32998A"],
  green:   ["#75C35A", "#53A238"],
  coral:   ["#ED927E", "#D46B55"],
  cyan:    ["#48B2B4", "#2B8C8E"],
  lime:    ["#8BC428", "#6AA010"],
  magenta: ["#CC63A6", "#AA4084"],
  amber:   ["#DE9A4B", "#B87425"],
  emerald: ["#3BA67D", "#217D59"],
  violet:  ["#7D63A4", "#5B427F"],
  rose:    ["#CA4E65", "#A83046"],
  indigo:  ["#5C7CCE", "#3856A9"],
  brown:   ["#9E7E73", "#7A5C52"],
  olive:   ["#717E46", "#505A2B"],
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