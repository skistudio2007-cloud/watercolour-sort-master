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
      {/* ================= TOP HEADER ================= */}
      <header className="relative w-full max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 z-20">
        {/* Back / Home */}
        <button
          onClick={onHome}
          className="w-10 h-10 rounded-2xl bg-card/75 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-foreground shadow-sm hover:bg-card active:scale-95 transition-all"
          title={t("back")}
          aria-label={t("back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Level Title & Difficulty */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="title-font text-lg md:text-xl font-black text-foreground">
              {t("level")} {state.currentLevel}
            </span>
            <span
              className="text-[9.5px] uppercase font-black px-2 py-0.5 rounded-full border"
              style={{ borderColor: diffColor, color: diffColor }}
            >
              {getDifficultyLabel(difficulty)}
            </span>
          </div>

          {/* Moves Count */}
          <span className="text-[11px] font-bold text-muted-foreground font-mono">
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
          className="w-10 h-10 rounded-2xl bg-card/75 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-foreground shadow-sm hover:bg-card active:scale-95 transition-all"
          title={t("pause")}
          aria-label={t("pause")}
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Milestone Level Banner */}
      {isMilestone && (
        <div className="w-full flex justify-center px-4 -mt-1 mb-1 z-10">
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-400/40 backdrop-blur px-3 py-0.5 rounded-full text-[10px] font-black text-amber-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {getMilestoneTitle(state.currentLevel)}
          </div>
        </div>
      )}

      {/* ================= PUZZLE ARENA (FULL SCREEN ON DESKTOP) ================= */}
      <main className="flex-1 w-full max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto flex flex-col justify-center items-center px-3 sm:px-6 relative z-10">
        <TubeGrid />
      </main>

      {/* ================= LOWER CONTROL DOCK (3 PREMIUM BUTTONS) ================= */}
      <footer className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-5 pt-2 z-20">
        <div className="w-full bg-card/90 backdrop-blur-xl border border-white/25 dark:border-white/15 rounded-3xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-around gap-3">
          {/* Restart */}
          <button
            onClick={() => setRestartConfirm(true)}
            disabled={state.gameState.isComplete || state.isAnimating}
            className="flex-1 py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center text-foreground/85 hover:bg-secondary/70 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black tracking-tight">{t("restart")}</span>
          </button>

          {/* Undo with Inventory Count / Buy $0.10 badge */}
          <button
            onClick={onUndoClick}
            disabled={!canUndo}
            className="flex-1 py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center text-foreground/85 hover:bg-secondary/70 active:scale-95 transition-all disabled:opacity-40 relative cursor-pointer"
          >
            <Undo2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black tracking-tight">{t("undo")}</span>
            <span
              className={`text-[8.5px] font-mono font-bold mt-0.5 px-2 py-0.2 rounded-full ${
                undosLeft > 0
                  ? "text-primary bg-primary/10"
                  : "text-amber-500 bg-amber-500/15"
              }`}
            >
              {undosLeft > 0 ? `${undosLeft} left` : "+ Buy $0.10"}
            </span>
          </button>

          {/* Hint with Inventory Count / Active state / Buy badge */}
          <button
            onClick={onHintClick}
            disabled={state.gameState.isComplete || state.isAnimating}
            className={`flex-1 py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all disabled:opacity-40 relative cursor-pointer ${
              state.hintMove
                ? "bg-amber-500/15 border border-amber-400/40 text-amber-500 shadow-sm"
                : "text-primary hover:bg-secondary/70 active:scale-95"
            }`}
          >
            <Lightbulb className={`w-5 h-5 mb-1 ${state.hintMove ? "text-amber-400 fill-amber-400 animate-pulse" : "text-primary"}`} />
            <span className="text-[10px] font-black tracking-tight">
              {state.hintMove ? "Active Hint" : t("hint")}
            </span>
            <span
              className={`text-[8.5px] font-mono font-bold mt-0.5 px-2 py-0.2 rounded-full ${
                state.hintMove
                  ? "text-amber-400 bg-amber-400/20 font-black"
                  : hintsLeft > 0
                  ? "text-emerald-500 bg-emerald-500/15"
                  : "text-amber-500 bg-amber-500/15"
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