// ─── Inventory & Power-up Consumables Manager ──────────────────────────────

const KEY_HINT_COUNT = "ws2_hints_count";
const KEY_UNDO_COUNT = "ws2_undos_count";

export function loadHintsCount(): number {
  try {
    const val = localStorage.getItem(KEY_HINT_COUNT);
    if (val === null) {
      // Default: 5 free hints starting balance
      localStorage.setItem(KEY_HINT_COUNT, "5");
      return 5;
    }
    return Math.max(0, parseInt(val, 10) || 0);
  } catch {
    return 5;
  }
}

export function saveHintsCount(count: number): void {
  try {
    localStorage.setItem(KEY_HINT_COUNT, Math.max(0, count).toString());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ws2_inventory_change"));
    }
  } catch {
    // Ignore
  }
}

export function loadUndosCount(): number {
  try {
    const val = localStorage.getItem(KEY_UNDO_COUNT);
    if (val === null) {
      // Default: 5 free undos starting balance
      localStorage.setItem(KEY_UNDO_COUNT, "5");
      return 5;
    }
    return Math.max(0, parseInt(val, 10) || 0);
  } catch {
    return 5;
  }
}

export function saveUndosCount(count: number): void {
  try {
    localStorage.setItem(KEY_UNDO_COUNT, Math.max(0, count).toString());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ws2_inventory_change"));
    }
  } catch {
    // Ignore
  }
}

export function useHintConsumable(): boolean {
  const current = loadHintsCount();
  if (current > 0) {
    saveHintsCount(current - 1);
    return true;
  }
  return false;
}

export function useUndoConsumable(): boolean {
  const current = loadUndosCount();
  if (current > 0) {
    saveUndosCount(current - 1);
    return true;
  }
  return false;
}

export function addHints(amount: number): void {
  saveHintsCount(loadHintsCount() + amount);
}

export function addUndos(amount: number): void {
  saveUndosCount(loadUndosCount() + amount);
}
