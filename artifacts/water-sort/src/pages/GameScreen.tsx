import React, { useEffect, useRef, useState } from "react";
import { showInterstitialAd } from "@/admob";
import { useGame } from "@/contexts/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import TubeGrid from "@/components/TubeGrid";
import LevelCompleteOverlay from "@/components/LevelCompleteOverlay";
import PauseMenu from "@/components/PauseMenu";
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  Undo2,
  Sparkles,
  Settings,
} from "lucide-react";
import {
  getDifficultyColor,
  getDifficultyLabel,
  getLevelDifficulty,
  isMilestoneLevel,
  getMilestoneTitle,
} from "@/lib/levelGenerator";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";
import {
  loadHintsCount,
  loadUndosCount,
  useHintConsumable,
  useUndoConsumable,
} from "@/lib/inventoryManager";
import PurchasePowerUpModal from "@/components/PurchasePowerUpModal";

export default function GameScreen() {
  const {
    state,
    navigate,
    handleUndo,
    handleRestart,
    handleHint,
  } = useGame();

  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [restartConfirm, setRestartConfirm] = useState(false);
  const [powerUpModal, setPowerUpModal] = useState<"hint" | "undo" | null>(null);
  const [hintsLeft, setHintsLeft] = useState(() => loadHintsCount());
  const [undosLeft, setUndosLeft] = useState(() => loadUndosCount());

  // Listen to inventory changes
  useEffect(() => {
    const handleInventoryChange = () => {
      setHintsLeft(loadHintsCount());
      setUndosLeft(loadUndosCount());
    };
    window.addEventListener("ws2_inventory_change", handleInventoryChange);
    return () => window.removeEventListener("ws2_inventory_change", handleInventoryChange);
  }, []);

  const isPremium = localStorage.getItem("ws2_is_premium") === "true";

  // Prevent multiple interstitial ads on the same level
  const lastAdLevel = useRef<number | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // INTERSTITIAL ADS COOLDOWN LOGIC (Section 23)
  // NEVER during active gameplay
  // NEVER during levels 1–10
  // Starting Level 11+, approximately every 2-3 completed levels
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !isPremium &&
      state.levelCompleteVisible &&
      state.currentLevel >= 11 &&
      state.currentLevel % 3 === 0 &&
      lastAdLevel.current !== state.currentLevel
    ) {
      lastAdLevel.current = state.currentLevel;
      // Slight delay so player sees the celebration first
      const timer = setTimeout(() => {
        showInterstitialAd().catch(() => {});
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.levelCompleteVisible, state.currentLevel, isPremium]);

  // ── Keyboard Shortcuts (Windows Desktop / Microsoft Store) ─────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input element has focus
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "Escape") {
        e.preventDefault();
        setPauseMenuOpen((prev) => !prev);
      } else if (e.key === "u" || e.key === "U") {
        if (canUndo) {
          e.preventDefault();
          onUndoClick();
        }
      } else if (e.key === "r" || e.key === "R") {
        if (!state.gameState?.isComplete && !state.isAnimating) {
          e.preventDefault();
          setRestartConfirm(true);
        }
      } else if (e.key === "h" || e.key === "H") {
        if (!state.gameState?.isComplete && !state.isAnimating) {
          e.preventDefault();
          onHintClick();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!state.gameState) return null;

  const difficulty = getLevelDifficulty(state.currentLevel);
  const diffColor = getDifficultyColor(difficulty);
  const isMilestone = isMilestoneLevel(state.currentLevel);

  const canUndo =
    state.gameState.history.length > 0 &&
    !state.gameState.isComplete &&
    !state.isAnimating;

  const onHome = () => {
    Haptics.tap();
    SFX.tap();
    navigate("menu");
  };

  const onUndoClick = () => {
    Haptics.tap();
    if (useUndoConsumable()) {
      handleUndo();
    } else {
      setPowerUpModal("undo");
    }
  };

  const onRestartClick = () => {
    Haptics.tap();
    SFX.tap();
    setRestartConfirm(false);
    handleRestart();
  };

  const onHintClick = () => {
    // If a hint is already actively showing on screen, re-highlight without consuming an extra hint
    if (state.hintMove) {
      Haptics.hint();
      SFX.hint();
      return;
    }

    Haptics.hint();
    if (useHintConsumable()) {
      handleHint();
    } else {
      setPowerUpModal("hint");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-full flex flex-col justify-between relative select-none pb-4"
    >
      {/* ================= TOP HEADER (FROSTED GLASS CAPSULE HUD) ================= */}
      <header className="relative w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 z-20">
        {/* Back / Home */}
        <button
          onClick={onHome}
          className="w-11 h-11 rounded-2xl bg-card/75 backdrop-blur-xl border border-white/25 dark:border-white/10 flex items-center justify-center text-foreground shadow-lg hover:bg-card active:scale-95 transition-all cyber-action-btn"
          title={t("back")}
          aria-label={t("back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Level Title & Difficulty inside Frosted Glass Capsule */}
        <div className="glass-capsule-hud px-5 py-2 flex flex-col items-center shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="title-font text-lg md:text-xl font-black text-foreground drop-shadow-sm">
              {t("level")} {state.currentLevel}
            </span>
            <span
              className="text-[9.5px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-sm"
              style={{ borderColor: diffColor, color: diffColor, backgroundColor: `${diffColor}18` }}
            >
              {getDifficultyLabel(difficulty)}
            </span>
          </div>

          {/* Moves Count */}
          <span className="text-[11px] font-extrabold text-muted-foreground font-mono mt-0.5">
            {state.gameState.moveCount} {t("moves")}
          </span>
        </div>

        {/* Pause / Settings */}
        <button
          onClick={() => {
            Haptics.tap();
            SFX.tap();
            setPauseMenuOpen(true);
          }}
          className="w-11 h-11 rounded-2xl bg-card/75 backdrop-blur-xl border border-white/25 dark:border-white/10 flex items-center justify-center text-foreground shadow-lg hover:bg-card active:scale-95 transition-all cyber-action-btn"
          title={t("pause")}
          aria-label={t("pause")}
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Milestone Level Banner */}
      {isMilestone && (
        <div className="w-full flex justify-center px-4 -mt-1 mb-1 z-10">
          <div className="bg-gradient-to-r from-amber-500/25 via-yellow-400/25 to-amber-500/25 border border-amber-400/50 backdrop-blur-md px-4 py-1 rounded-full text-[11px] font-black text-amber-400 flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> {getMilestoneTitle(state.currentLevel)}
          </div>
        </div>
      )}

      {/* ================= PUZZLE ARENA (FULL SCREEN ON DESKTOP) ================= */}
      <main className="flex-1 w-full max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto flex flex-col justify-center items-center px-3 sm:px-6 relative z-10">
        <TubeGrid />
      </main>

      {/* ================= LOWER CONTROL DOCK (CYBER GLASS DOCK) ================= */}
      <footer className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-5 pt-2 z-20">
        <div className="cyber-glass-dock w-full p-2.5 flex items-center justify-around gap-3">
          {/* Restart */}
          <button
            onClick={() => setRestartConfirm(true)}
            disabled={state.gameState.isComplete || state.isAnimating}
            className="flex-1 py-3 px-3 rounded-2xl flex flex-col items-center justify-center text-foreground/85 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40 cursor-pointer cyber-action-btn"
          >
            <RotateCcw className="w-5 h-5 mb-1 text-slate-300 dark:text-slate-200" />
            <span className="text-[10.5px] font-black tracking-tight">{t("restart")}</span>
          </button>

          {/* Undo with Inventory Count / Buy $0.10 badge */}
          <button
            onClick={onUndoClick}
            disabled={!canUndo}
            className="flex-1 py-3 px-3 rounded-2xl flex flex-col items-center justify-center text-foreground/85 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40 relative cursor-pointer cyber-action-btn"
          >
            <Undo2 className="w-5 h-5 mb-1 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <span className="text-[10.5px] font-black tracking-tight">{t("undo")}</span>
            <span
              className={`text-[9px] font-mono font-black mt-1 px-2.5 py-0.5 rounded-full border shadow-sm ${
                undosLeft > 0
                  ? "text-sky-400 bg-sky-500/15 border-sky-400/30"
                  : "text-amber-400 bg-amber-500/20 border-amber-400/40"
              }`}
            >
              {undosLeft > 0 ? `${undosLeft} left` : "+ Buy $0.10"}
            </span>
          </button>

          {/* Hint with Inventory Count / Active state / Buy badge */}
          <button
            onClick={onHintClick}
            disabled={state.gameState.isComplete || state.isAnimating}
            className={`flex-1 py-3 px-3 rounded-2xl flex flex-col items-center justify-center transition-all disabled:opacity-40 relative cursor-pointer cyber-action-btn ${
              state.hintMove
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.35)]"
                : "text-primary hover:bg-white/10 active:scale-95"
            }`}
          >
            <Lightbulb className={`w-5 h-5 mb-1 ${state.hintMove ? "text-amber-400 fill-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" : "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]"}`} />
            <span className="text-[10.5px] font-black tracking-tight">
              {state.hintMove ? "Active Hint" : t("hint")}
            </span>
            <span
              className={`text-[9px] font-mono font-black mt-1 px-2.5 py-0.5 rounded-full border shadow-sm ${
                state.hintMove
                  ? "text-amber-300 bg-amber-400/30 border-amber-400 font-black"
                  : hintsLeft > 0
                  ? "text-emerald-400 bg-emerald-500/20 border-emerald-400/30"
                  : "text-amber-400 bg-amber-500/20 border-amber-400/40"
              }`}
            >
              {state.hintMove ? "Move Shown" : hintsLeft > 0 ? `${hintsLeft} left` : "+ Buy $0.10"}
            </span>
          </button>
        </div>
      </footer>

      {/* ================= RESTART CONFIRM DIALOG ================= */}
      <AnimatePresence>
        {restartConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-xs w-full flex flex-col items-center text-center"
            >
              <RotateCcw className="w-10 h-10 text-primary mb-3" />
              <h3 className="title-font text-base font-black text-foreground mb-1">
                {t("restart_confirm")}
              </h3>
              <p className="text-xs text-muted-foreground mb-5">
                The level will reset to its initial layout.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setRestartConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary font-bold text-xs text-foreground"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={onRestartClick}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md"
                >
                  {t("restart")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= OVERLAYS ================= */}
      <AnimatePresence>
        {state.levelCompleteVisible && <LevelCompleteOverlay />}
        {pauseMenuOpen && <PauseMenu onClose={() => setPauseMenuOpen(false)} />}
        {powerUpModal && (
          <PurchasePowerUpModal
            type={powerUpModal}
            onClose={() => setPowerUpModal(null)}
            onPurchased={() => {
              setHintsLeft(loadHintsCount());
              setUndosLeft(loadUndosCount());
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}