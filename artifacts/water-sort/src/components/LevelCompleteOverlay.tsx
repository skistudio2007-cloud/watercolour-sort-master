import React, { useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import { Trophy, Star, ArrowRight, RotateCcw, Home, Sparkles } from "lucide-react";
import { calcStars, getLevel, getDifficultyColor, getDifficultyLabel, isMilestoneLevel, getMilestoneTitle } from "@/lib/levelGenerator";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";

export default function LevelCompleteOverlay() {
  const { state, navigate, handleNextLevel, handleRestart } = useGame();
  const level = getLevel(state.currentLevel);
  const moves = state.gameState?.moveCount ?? 0;
  const stars = calcStars(level.parMoves, moves);
  const isMilestone = isMilestoneLevel(state.currentLevel);

  const progress = state.progress.levels[state.currentLevel] || {
    stars,
    moveCount: moves,
    bestMoves: moves,
    timeSeconds: state.elapsedSeconds,
  };

  const particles = useMemo(() => {
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      dx: `${((i * 53) % 401) - 200}px`,
      dy: `${((i * 79) % 401) - 120}px`,
      rot: `${(i * 67) % 360}deg`,
      color: colors[i % colors.length],
      delay: (i % 10) * 0.03,
    }));
  }, []);

  const onNext = () => {
    Haptics.tap();
    SFX.tap();
    handleNextLevel();
  };

  const onReplay = () => {
    Haptics.tap();
    SFX.tap();
    handleRestart();
  };

  const onHome = () => {
    Haptics.tap();
    SFX.tap();
    navigate("menu");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-background/85 backdrop-blur-md flex flex-col items-center justify-center p-5 select-none"
    >
      {/* Confetti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="level-complete-confetti"
          style={
            {
              "--dx": p.dx,
              "--dy": p.dy,
              "--rot": p.rot,
              "--color": p.color,
              animationDelay: `${p.delay}s`,
            } as any
          }
        />
      ))}

      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.45, delay: 0.1 }}
        className="w-full max-w-sm bg-card/95 border border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] p-7 flex flex-col items-center relative overflow-hidden backdrop-blur-xl"
      >
        {/* Milestone Top Banner */}
        {isMilestone && (
          <div className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-center text-xs font-black py-1.5 px-3 rounded-full mb-4 flex items-center justify-center gap-1.5 shadow-md">
            <Sparkles className="w-4 h-4 fill-current" />
            {getMilestoneTitle(state.currentLevel)}
          </div>
        )}

        {/* Trophy Emblem */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 shadow-amber-500/30"
        >
          <Trophy className="w-10 h-10 text-white stroke-[2.2]" />
        </motion.div>

        <h2 className="title-font text-2xl font-black mb-0.5 text-foreground text-center">
          {t("level_complete")}
        </h2>
        <p className="text-muted-foreground font-semibold text-xs mb-5">
          {t("level")} {state.currentLevel} ·{" "}
          <span style={{ color: getDifficultyColor(level.difficulty) }}>
            {getDifficultyLabel(level.difficulty)}
          </span>
        </p>

        {/* Stars */}
        <div className="flex gap-3 mb-6">
          {[1, 2, 3].map((star, i) => (
            <motion.div
              key={star}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: star <= stars ? 1 : 0.8, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.18, type: "spring", stiffness: 350 }}
            >
              <Star
                className={`w-11 h-11 ${
                  star <= stars
                    ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_4px_12px_rgba(250,204,21,0.4)]"
                    : "text-secondary fill-secondary/50"
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-secondary/60 rounded-2xl p-3 flex flex-col items-center border border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
              {t("moves")}
            </span>
            <span className="text-xl font-black text-foreground">{moves}</span>
            <span className="text-[9px] text-muted-foreground">{t("par")}: {level.parMoves}</span>
          </div>
          <div className="bg-secondary/60 rounded-2xl p-3 flex flex-col items-center border border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
              {t("time")}
            </span>
            <span className="text-xl font-black text-foreground">
              {Math.floor(state.elapsedSeconds / 60)}:
              {String(state.elapsedSeconds % 60).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-emerald-500 font-bold">{t("perfect")}</span>
          </div>
        </div>

        {/* Visually Dominant Next Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="primary-action w-full py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/25 flex justify-center items-center gap-2 mb-3"
        >
          {t("next_level")} <ArrowRight className="w-6 h-6 stroke-[2.5]" />
        </motion.button>

        {/* Replay & Home Buttons */}
        <div className="w-full flex items-center justify-between gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onReplay}
            className="flex-1 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> {t("replay")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onHome}
            className="flex-1 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" /> {t("home")}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
