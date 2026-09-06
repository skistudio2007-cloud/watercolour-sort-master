import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Box, TestTube2, Image as ImageIcon, Award, Check, Lock, Sparkles, Flame, Gem, Play } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { useSettings } from "@/contexts/SettingsContext";
import BottlePreview from "@/components/BottlePreview";
import {
  BACKGROUNDS,
  BackgroundId,
  saveBackground,
  isBackgroundUnlocked,
  unlockBackground,
} from "@/lib/themeManager";
import {
  BOTTLE_SKINS,
  BottleSkin,
  setActiveBottle,
  loadCosmetics,
  loadStats,
  loadDailyState,
  loadAchievements,
  unlockBottleSkin,
  isRareBottle,
} from "@/lib/storage";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { loadPlayerProfile } from "@/lib/leaderboardManager";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";
import { showRewardedAd } from "@/lib/admanager";
import RareTubeModal from "@/components/RareTubeModal";
import ThemeUnlockModal from "@/components/ThemeUnlockModal";

export default function CollectionScreen() {
  const { state, navigate, refreshCosmetics } = useGame();
  const { settings } = useSettings();
  const [tab, setTab] = useState<"tubes" | "backgrounds" | "awards">("tubes");
  const [selectedRareBottle, setSelectedRareBottle] = useState<{
    id: BottleSkin;
    label: string;
    desc: string;
  } | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<{
    id: BackgroundId;
    name: string;
    desc: string;
    gradient: string;
  } | null>(null);

  const cosmetics = loadCosmetics();
  const currentLevel = state.progress.maxUnlockedLevel;
  const stats = loadStats();
  const daily = loadDailyState();
  const profile = loadPlayerProfile();
  const achievements = loadAchievements();

  const handleSelectTube = (tube: { id: BottleSkin; label: string; desc: string }) => {
    Haptics.tap();
    SFX.tap();
    const isUnlocked = cosmetics.unlockedBottles.includes(tube.id);

    if (isUnlocked) {
      setActiveBottle(tube.id);
      refreshCosmetics();
      return;
    }

    // Check if rare
    if (isRareBottle(tube.id)) {
      setSelectedRareBottle(tube);
      return;
    }

    // Non-rare tube -> Watch Rewarded Ad
    showRewardedAd(
      "bottle",
      () => {
        unlockBottleSkin(tube.id);
        setActiveBottle(tube.id);
        refreshCosmetics();
        Haptics.levelComplete();
        SFX.achievement();
      },
      () => {
        console.log("[Collection] Ad cancelled/failed for tube");
      }
    );
  };

  const handleSelectBackground = (bg: { id: BackgroundId; name: string; desc: string; gradient: string }) => {
    Haptics.tap();
    SFX.tap();
    const isUnlocked = isBackgroundUnlocked(bg.id);

    if (isUnlocked) {
      saveBackground(bg.id);
      refreshCosmetics();
      return;
    }

    // Open Theme Unlock Modal ($0.49)
    setSelectedTheme(bg);
  };

  const getAwardProgress = (id: string): { current: number; target: number; label: string } => {
    switch (id) {
      case "first_blood": return { current: stats.totalLevelsCompleted, target: 1, label: "Levels" };
      case "level_10": return { current: stats.totalLevelsCompleted, target: 10, label: "Levels" };
      case "level_25": return { current: stats.totalLevelsCompleted, target: 25, label: "Levels" };
      case "level_50": return { current: stats.totalLevelsCompleted, target: 50, label: "Levels" };
      case "level_100": return { current: stats.totalLevelsCompleted, target: 100, label: "Levels" };
      case "level_250": return { current: stats.totalLevelsCompleted, target: 250, label: "Levels" };
      case "level_500": return { current: stats.totalLevelsCompleted, target: 500, label: "Levels" };
      case "level_1000": return { current: stats.totalLevelsCompleted, target: 1000, label: "Levels" };
      case "level_2500": return { current: stats.totalLevelsCompleted, target: 2500, label: "Levels" };
      case "level_5000": return { current: stats.totalLevelsCompleted, target: 5000, label: "Levels" };
      case "level_10000": return { current: stats.totalLevelsCompleted, target: 10000, label: "Levels" };

      case "tubes_10": return { current: profile.totalTubesSorted, target: 10, label: "Tubes" };
      case "tubes_100": return { current: profile.totalTubesSorted, target: 100, label: "Tubes" };
      case "tubes_1000": return { current: profile.totalTubesSorted, target: 1000, label: "Tubes" };
      case "tubes_10000": return { current: profile.totalTubesSorted, target: 10000, label: "Tubes" };
      case "tubes_100000": return { current: profile.totalTubesSorted, target: 100000, label: "Tubes" };

      case "daily_3": return { current: daily.streak, target: 3, label: "Days" };
      case "daily_7": return { current: daily.streak, target: 7, label: "Days" };
      case "daily_30": return { current: daily.streak, target: 30, label: "Days" };
      case "daily_100": return { current: daily.streak, target: 100, label: "Days" };
      case "daily_365": return { current: daily.streak, target: 365, label: "Days" };

      case "poured_100": return { current: stats.totalPours, target: 100, label: "Pours" };
      case "perfect_50": return { current: stats.perfectLevels, target: 50, label: "3-Stars" };
      default: return { current: 0, target: 1, label: "" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-full pb-20 flex flex-col relative select-none"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
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
            <Box className="w-5 h-5 text-accent" />
            <h1 className="title-font text-lg font-black">{t("collection")}</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4 w-full max-w-2xl mx-auto">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-secondary/70 rounded-2xl">
          <button
            onClick={() => setTab("tubes")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              tab === "tubes" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <TestTube2 className="w-4 h-4" /> Tubes
          </button>
          <button
            onClick={() => setTab("backgrounds")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              tab === "backgrounds" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> BGs
          </button>
          <button
            onClick={() => setTab("awards")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              tab === "awards" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Award className="w-4 h-4" /> Awards
          </button>
        </div>

        {/* ── Tab 1: 20 Unique Tubes ───────────────────────────────────── */}
        {tab === "tubes" && (
          <div className="grid grid-cols-2 gap-3">
            {BOTTLE_SKINS.map((tube) => {
              const isEquipped = cosmetics.activeBottle === tube.id;
              const isUnlocked = cosmetics.unlockedBottles.includes(tube.id);
              const isRare = isRareBottle(tube.id);

              return (
                <button
                  key={tube.id}
                  onClick={() => handleSelectTube(tube)}
                  className={`p-4 rounded-2xl bg-card border text-left flex flex-col items-center gap-2 relative transition-all ${
                    isEquipped
                      ? "border-primary shadow-lg ring-2 ring-primary/40"
                      : isRare && !isUnlocked
                      ? "border-amber-400/40 hover:border-amber-400"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {/* Equipped Check */}
                  {isEquipped && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}

                  {/* Rare Ribbon */}
                  {isRare && (
                    <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 text-[8px] font-black uppercase tracking-wider">
                      <Gem className="w-2.5 h-2.5 fill-current" />
                      Rare
                    </span>
                  )}

                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <span className="absolute top-2.5 right-2.5 text-muted-foreground/70">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}

                  <BottlePreview bottleId={tube.id} className="w-11 h-24 my-2" />
                  <span className="font-bold text-xs text-foreground mt-1 text-center">
                    {tube.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center line-clamp-1">
                    {tube.desc}
                  </span>

                  {/* Status / Action badge */}
                  <div
                    className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isEquipped
                        ? "bg-primary/20 text-primary"
                        : isUnlocked
                        ? "bg-secondary text-foreground"
                        : isRare
                        ? "bg-amber-400/20 text-amber-400 font-black"
                        : "bg-sky-500/15 text-sky-400 flex items-center gap-1"
                    }`}
                  >
                    {isEquipped
                      ? "Equipped"
                      : isUnlocked
                      ? "Use this"
                      : isRare
                      ? "Unlock $0.99"
                      : "Watch Ad"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Tab 2: 10 Dark Backgrounds ──────────────────────────────── */}
        {tab === "backgrounds" && (
          <div className="grid grid-cols-2 gap-3">
            {BACKGROUNDS.map((bg) => {
              const activeBg = localStorage.getItem("ws2_active_bg") || "deep_ocean";
              const isEquipped = activeBg === bg.id;
              const isUnlocked = isBackgroundUnlocked(bg.id);

              return (
                <button
                  key={bg.id}
                  onClick={() => handleSelectBackground(bg)}
                  className={`rounded-2xl border text-left overflow-hidden relative transition-all ${
                    isEquipped
                      ? "border-primary shadow-lg ring-2 ring-primary/40"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="h-20 w-full relative" style={{ background: settings.darkMode ? bg.gradient : bg.lightGradient }}>
                    {isEquipped && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 shadow">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-card">
                    <span className="font-bold text-xs text-foreground block">{bg.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{bg.desc}</span>

                    <div
                      className={`mt-2 text-[10px] font-bold ${
                        isEquipped
                          ? "text-primary"
                          : isUnlocked
                          ? "text-muted-foreground"
                          : "text-purple-400 font-black"
                      }`}
                    >
                      {isEquipped
                        ? "Equipped"
                        : isUnlocked
                        ? "Select"
                        : "Unlock $0.49"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Tab 3: Permanent Awards & Milestones ─────────────────────── */}
        {tab === "awards" && (
          <div className="flex flex-col gap-2.5">
            {/* Live stats banner */}
            <div className="p-3.5 rounded-2xl bg-card/90 border border-primary/25 flex items-center justify-around text-center mb-1">
              <div>
                <span className="text-base font-black text-primary block">{profile.totalTubesSorted.toLocaleString()}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Tubes Sorted</span>
              </div>
              <div className="w-[1px] h-7 bg-border" />
              <div>
                <span className="text-base font-black text-amber-400 block">{stats.totalLevelsCompleted.toLocaleString()}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Completed</span>
              </div>
              <div className="w-[1px] h-7 bg-border" />
              <div>
                <span className="text-base font-black text-emerald-400 block">{Object.keys(achievements.unlocked).length}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Awards</span>
              </div>
            </div>

            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = !!achievements.unlocked[ach.id];
              const prog = getAwardProgress(ach.id);
              const percent = Math.min(100, Math.round((prog.current / prog.target) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isUnlocked
                      ? "bg-card border-border/80 shadow-sm"
                      : "bg-card/40 border-border/40 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                        isUnlocked ? "bg-amber-400/20 text-amber-400" : "bg-secondary text-muted-foreground"
                      }`}>
                        {ach.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          {ach.title}
                          {isUnlocked && <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {ach.description}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isUnlocked ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"
                    }`}>
                      {isUnlocked ? "Unlocked" : `${prog.current.toLocaleString()} / ${prog.target.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Progress bar if locked and has target > 1 */}
                  {!isUnlocked && prog.target > 1 && (
                    <div className="w-full bg-secondary/70 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rare Tube $0.99 Unlock Modal */}
      {selectedRareBottle && (
        <RareTubeModal
          bottle={selectedRareBottle}
          onClose={() => setSelectedRareBottle(null)}
          onUnlocked={() => {
            refreshCosmetics();
          }}
        />
      )}

      {/* Theme $0.49 Unlock Modal */}
      {selectedTheme && (
        <ThemeUnlockModal
          background={selectedTheme}
          onClose={() => setSelectedTheme(null)}
          onUnlocked={() => {
            refreshCosmetics();
          }}
        />
      )}
    </motion.div>
  );
}
