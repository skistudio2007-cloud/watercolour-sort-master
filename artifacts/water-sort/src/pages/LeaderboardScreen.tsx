import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Globe, Calendar, Award, Sparkles, ChevronUp } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import {
  LeaderboardTab,
  getLeaderboardEntries,
  loadPlayerProfile,
} from "@/lib/leaderboardManager";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";

export default function LeaderboardScreen() {
  const { navigate } = useGame();
  const [tab, setTab] = useState<LeaderboardTab>("global");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setVersion((v) => v + 1);
    window.addEventListener("ws2_leaderboard_update", onUpdate);
    return () => window.removeEventListener("ws2_leaderboard_update", onUpdate);
  }, []);

  const { entries, playerRank, newBestRank } = getLeaderboardEntries(tab);
  const profile = loadPlayerProfile();

  const handleTabChange = (nextTab: LeaderboardTab) => {
    Haptics.tap();
    SFX.tap();
    setTab(nextTab);
  };

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-full pb-20 flex flex-col relative select-none"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/85 backdrop-blur-xl border-b border-border">
        <button
          onClick={() => {
            Haptics.tap();
            navigate("menu");
          }}
          className="icon-button"
        >
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h1 className="title-font text-lg font-black">{t("leaderboard")}</h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="p-4 flex flex-col gap-4">
        {/* New Best Rank Toast */}
        {newBestRank && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-2.5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-lg"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            {t("best_rank")} #{playerRank}
          </motion.div>
        )}

        {/* Tab Switcher */}
        <div className="segmented">
          <button
            className={tab === "global" ? "active" : ""}
            onClick={() => handleTabChange("global")}
          >
            <Globe className="w-4 h-4" /> {t("global")}
          </button>
          <button
            className={tab === "weekly" ? "active" : ""}
            onClick={() => handleTabChange("weekly")}
          >
            <Calendar className="w-4 h-4" /> {t("weekly")}
          </button>
          <button
            className={tab === "all_time" ? "active" : ""}
            onClick={() => handleTabChange("all_time")}
          >
            <Award className="w-4 h-4" /> {t("all_time")}
          </button>
        </div>

        {/* Primary Metric Legend */}
        <div className="w-full bg-secondary/40 rounded-2xl p-2.5 flex items-center justify-between border border-border/40 text-[11px]">
          <span className="text-muted-foreground font-semibold">
            {t("rank")} by: <strong className="text-primary">{t("total_tubes_sorted")}</strong>
          </span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md font-mono">
            Anti-Cheat Verified
          </span>
        </div>

        {/* Top 3 Podium */}
        <div className="w-full grid grid-cols-3 gap-2 pt-4 pb-2 items-end">
          {/* Rank 2 (Left) */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center text-slate-900 font-bold shadow-md">
                  🥈
                </div>
                <span className="absolute -bottom-2 inset-x-0 text-center text-[10px] font-black bg-slate-400 text-slate-950 rounded-full px-1">
                  #2
                </span>
              </div>
              <span className="text-xs font-bold text-foreground text-center truncate max-w-[80px]">
                {topThree[1].name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono font-bold">
                {topThree[1].tubesSorted.toLocaleString()}
              </span>
            </div>
          )}

          {/* Rank 1 (Center - Elevated) */}
          {topThree[0] && (
            <div className="flex flex-col items-center -mt-4">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-slate-900 font-bold shadow-xl shadow-amber-500/25 border-2 border-yellow-300">
                  👑
                </div>
                <span className="absolute -bottom-2 inset-x-0 text-center text-[10px] font-black bg-amber-400 text-slate-950 rounded-full px-1">
                  #1
                </span>
              </div>
              <span className="text-xs font-black text-foreground text-center truncate max-w-[90px]">
                {topThree[0].name}
              </span>
              <span className="text-[11px] text-amber-500 font-mono font-black">
                {topThree[0].tubesSorted.toLocaleString()}
              </span>
            </div>
          )}

          {/* Rank 3 (Right) */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                  🥉
                </div>
                <span className="absolute -bottom-2 inset-x-0 text-center text-[10px] font-black bg-amber-600 text-white rounded-full px-1">
                  #3
                </span>
              </div>
              <span className="text-xs font-bold text-foreground text-center truncate max-w-[80px]">
                {topThree[2].name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono font-bold">
                {topThree[2].tubesSorted.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Player's Fixed Personal Rank Card (Section 33) */}
        <div className="w-full bg-gradient-to-r from-primary/20 via-card to-card border-2 border-primary/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow">
              #{playerRank}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-foreground">{profile.name} (You)</span>
              <span className="text-[10px] text-muted-foreground">
                {t("tubes_sorted")}: <strong className="text-foreground">{profile.totalTubesSorted}</strong>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase text-primary tracking-wider block">
              {t("your_rank")}
            </span>
            <span className="text-xs font-black text-foreground">Top {Math.max(1, Math.min(99, Math.floor((playerRank / 8500) * 100)))}%</span>
          </div>
        </div>

        {/* Scrollable Competitors List */}
        <div className="flex flex-col gap-2">
          {remaining.map((entry) => (
            <div
              key={entry.playerId}
              className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                entry.isCurrentPlayer
                  ? "bg-primary/10 border-primary/40 shadow-sm"
                  : "bg-card/70 border-border/60 hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono font-bold text-xs text-muted-foreground">
                  {entry.rank}
                </span>
                <span className="text-base">{entry.countryCode}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground truncate max-w-[130px]">
                    {entry.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {entry.levelsCompleted} {t("levels_completed")}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-black text-primary block">
                  {entry.tubesSorted.toLocaleString()}
                </span>
                <span className="text-[9px] text-muted-foreground">tubes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
