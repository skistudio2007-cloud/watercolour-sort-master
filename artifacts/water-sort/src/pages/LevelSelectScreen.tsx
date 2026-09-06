import React, { useState, useMemo, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import {
  TOTAL_LEVELS,
  getChapterName,
  getLevelDifficulty,
  getDifficultyColor,
} from "@/lib/levelGenerator";
import { ArrowLeft, Lock, Star, ChevronLeft, ChevronRight, Navigation } from "lucide-react";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";

const CHUNK_SIZE = 100; // 100 levels per chapter page (100 chapters total = 10,000 levels)

export default function LevelSelectScreen() {
  const { state, navigate, startLevel } = useGame();
  const { progress } = state;
  const currentLevel = progress.maxUnlockedLevel;

  // Compute which chapter the player's current level is in
  const currentChapterIdx = Math.max(
    1,
    Math.min(100, Math.ceil(currentLevel / CHUNK_SIZE))
  );

  const [selectedChapter, setSelectedChapter] = useState(currentChapterIdx);

  const startLevelId = (selectedChapter - 1) * CHUNK_SIZE + 1;
  const endLevelId = Math.min(TOTAL_LEVELS, selectedChapter * CHUNK_SIZE);

  const levelsInChapter = useMemo(() => {
    const list = [];
    for (let l = startLevelId; l <= endLevelId; l++) {
      list.push(l);
    }
    return list;
  }, [startLevelId, endLevelId]);

  let completedInChapter = 0;
  levelsInChapter.forEach((l) => {
    if (progress.levels[l]?.completed) completedInChapter++;
  });

  const handleLevelClick = (levelId: number) => {
    Haptics.tap();
    SFX.tap();
    startLevel(levelId);
  };

  const jumpToCurrent = () => {
    Haptics.tap();
    SFX.tap();
    setSelectedChapter(currentChapterIdx);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-full pb-20 flex flex-col relative select-none"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 p-4 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              Haptics.tap();
              navigate("menu");
            }}
            className="icon-button"
          >
            <ArrowLeft />
          </button>
          <div className="flex flex-col items-center">
            <span className="mono-label text-[10px] uppercase text-primary font-black">
              {t("chapter")} {selectedChapter} / 100
            </span>
            <h1 className="title-font text-base font-black">
              {getChapterName(selectedChapter)}
            </h1>
          </div>
          <button
            onClick={jumpToCurrent}
            aria-label={t("jump_to_current")}
            className="p-2 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-4">
        {/* Chapter Carousel Controller */}
        <div className="flex items-center justify-between bg-card/85 backdrop-blur border border-border rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <button
            onClick={() => {
              Haptics.tap();
              setSelectedChapter((c) => Math.max(1, c - 1));
            }}
            disabled={selectedChapter <= 1}
            className="p-2 rounded-xl text-foreground hover:bg-secondary disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-foreground">
              {t("level")} {startLevelId} – {endLevelId}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {completedInChapter} / {levelsInChapter.length} {t("levels_completed")}
            </span>
          </div>

          <button
            onClick={() => {
              Haptics.tap();
              setSelectedChapter((c) => Math.min(100, c + 1));
            }}
            disabled={selectedChapter >= 100}
            className="p-2 rounded-xl text-foreground hover:bg-secondary disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Completion Progress Bar */}
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(completedInChapter / levelsInChapter.length) * 100}%` }}
          />
        </div>

        {/* 100-Level Paginated Grid (Up to 10 cols on full Windows screen) */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 sm:gap-3 md:gap-3.5">
          {levelsInChapter.map((levelId) => {
            const isUnlocked = levelId <= progress.maxUnlockedLevel;
            const isCurrent = levelId === currentLevel;
            const lvlProgress = progress.levels[levelId];
            const diffColor = getDifficultyColor(getLevelDifficulty(levelId));

            return (
              <motion.button
                key={levelId}
                whileTap={isUnlocked ? { scale: 0.94 } : {}}
                onClick={() => isUnlocked && handleLevelClick(levelId)}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition-all shadow-sm ${
                  isCurrent
                    ? "bg-primary text-primary-foreground border-2 border-primary ring-2 ring-primary/40 shadow-md scale-105 z-10"
                    : isUnlocked
                    ? lvlProgress?.completed
                      ? "bg-card/90 text-foreground border border-emerald-500/40"
                      : "bg-card text-foreground border border-border hover:border-primary/50"
                    : "bg-secondary/40 text-muted-foreground/40 border border-transparent cursor-not-allowed"
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-sm">{levelId}</span>
                    {lvlProgress?.completed && (
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-2 h-2 ${
                              s <= (lvlProgress.stars || 1)
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30 fill-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {/* Difficulty corner dot */}
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: diffColor }}
                    />
                  </>
                ) : (
                  <Lock className="w-4 h-4 opacity-40" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
