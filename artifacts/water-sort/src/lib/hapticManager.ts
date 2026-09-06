// ─── Haptic Feedback System ──────────────────────────────────────────────────

let _hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean): void {
  _hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return _hapticsEnabled;
}

function vibrate(pattern: number | number[]): void {
  if (!_hapticsEnabled || typeof window === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers restrict vibrate without user interaction or in certain contexts
  }
}

export const Haptics = {
  // Light subtle tap on buttons
  tap() {
    vibrate(10);
  },

  // Subtle tap on selecting a tube
  select() {
    vibrate(15);
  },

  // Satisfying light pulse on valid liquid pour
  pour() {
    vibrate([12, 40, 18]);
  },

  // Gentle warning shake feedback on invalid move
  invalid() {
    vibrate([25, 30, 25]);
  },

  // Chime pulse when a single tube is completed
  tubeComplete() {
    vibrate([20, 40, 30, 40, 40]);
  },

  // Celebration success pattern on level completion
  levelComplete() {
    vibrate([30, 50, 40, 60, 60]);
  },

  // Subtle alert for hints
  hint() {
    vibrate([15, 60, 20]);
  },
};
