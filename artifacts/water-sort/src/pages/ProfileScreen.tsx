import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Edit2,
  Check,
  Trophy,
  Flame,
  Award,
  TestTube2,
  ShieldCheck,
  Sparkles,
  Link,
} from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import {
  loadPlayerProfile,
  savePlayerProfile,
  PlayerProfile,
} from "@/lib/leaderboardManager";
import { loadStats, loadProgress, loadDailyState, loadChallenges } from "@/lib/storage";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";

const AVATAR_OPTIONS = [
  { id: "droplet", label: "💧" },
  { id: "crown", label: "👑" },
  { id: "sparkles", label: "✨" },
  { id: "trophy", label: "🏆" },
  { id: "flask", label: "🧪" },
  { id: "star", label: "⭐" },
  { id: "gem", label: "💎" },
  { id: "target", label: "🎯" },
];

export default function ProfileScreen() {
  const { state, navigate } = useGame();
  const [profile, setProfile] = useState<PlayerProfile>(loadPlayerProfile);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [accountSynced, setAccountSynced] = useState(profile.isAccountLinked);

  const stats = loadStats();
  const progress = loadProgress();
  const daily = loadDailyState();
  const challenges = loadChallenges();

  const completedLevelCount = Object.values(progress.levels).filter((l) => l.completed).length;

  const handleSaveName = () => {
    Haptics.tap();
    SFX.tap();
    const clean = nameInput.trim() || "Guest Chemist";
    const updated = { ...profile, name: clean };
    setProfile(updated);
    savePlayerProfile(updated);
    setEditingName(false);
  };

  const handleSelectAvatar = (avatarId: string) => {
    Haptics.tap();
    SFX.tap();
    const updated = { ...profile, avatar: avatarId };
    setProfile(updated);
    savePlayerProfile(updated);
  };

  const handleLinkAccount = () => {
    Haptics.levelComplete();
    SFX.achievement();
    const updated = { ...profile, isAccountLinked: true };
    setProfile(updated);
    savePlayerProfile(updated);
    setAccountSynced(true);
  };

  const getAvatarDisplay = (id: string) => {
    return AVATAR_OPTIONS.find((a) => a.id === id)?.label || "💧";
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
          <User className="w-5 h-5 text-primary" />
          <h1 className="title-font text-lg font-black">{t("profile")}</h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="p-5 flex flex-col gap-6">
        {/* Avatar & Player Name Card */}
        <div className="w-full bg-card/85 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center relative overflow-hidden">
          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent border-2 border-primary/40 flex items-center justify-center text-4xl shadow-inner mb-3">
            {getAvatarDisplay(profile.avatar)}
          </div>

          {/* Avatar Selector Tray */}
          <div className="flex items-center gap-2 mb-4 bg-secondary/50 p-1.5 rounded-2xl">
            {AVATAR_OPTIONS.map((a) => (
              <button
                key={a.id}
                onClick={() => handleSelectAvatar(a.id)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-transform ${
                  profile.avatar === a.id
                    ? "bg-card shadow-sm scale-110 border border-primary/50"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Name Editor */}
          {editingName ? (
            <div className="flex items-center gap-2 w-full max-w-[240px]">
              <input
                type="text"
                maxLength={18}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 bg-secondary px-3 py-1.5 rounded-xl text-sm font-bold text-foreground outline-none border border-primary"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-2 rounded-xl bg-primary text-primary-foreground shadow"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="title-font text-xl font-black text-foreground">
                {profile.name}
              </h2>
              <button
                onClick={() => {
                  setNameInput(profile.name);
                  setEditingName(true);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <span className="text-[11px] font-bold text-primary mt-1">
            {t("level")} {progress.maxUnlockedLevel} Master
          </span>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/70 border border-border/70 rounded-2xl p-3.5 flex flex-col">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TestTube2 className="w-4 h-4" />
              <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                {t("tubes_sorted")}
              </span>
            </div>
            <span className="text-xl font-black text-foreground">
              {profile.totalTubesSorted.toLocaleString()}
            </span>
          </div>

          <div className="bg-card/70 border border-border/70 rounded-2xl p-3.5 flex flex-col">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                {t("levels_completed")}
              </span>
            </div>
            <span className="text-xl font-black text-foreground">{completedLevelCount}</span>
          </div>

          <div className="bg-card/70 border border-border/70 rounded-2xl p-3.5 flex flex-col">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                {t("daily_streak")}
              </span>
            </div>
            <span className="text-xl font-black text-foreground">{daily.streak} Days</span>
          </div>

          <div className="bg-card/70 border border-border/70 rounded-2xl p-3.5 flex flex-col">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                {t("challenges")}
              </span>
            </div>
            <span className="text-xl font-black text-foreground">
              {(challenges.weeklyCompleted?.length ?? 0) + (challenges.dailyChallengeCompleted ? 1 : 0)}
            </span>
          </div>
        </div>

        {/* Optional Account Link Card (Section 25) */}
        <div className="w-full bg-card/60 border border-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                {accountSynced ? "Account Synchronized" : "Cloud Save (Optional)"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {accountSynced ? "Backup saved to cloud profile" : "Guest mode active — progress saved locally"}
              </span>
            </div>
          </div>

          {!accountSynced && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLinkAccount}
              className="py-1.5 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm flex items-center gap-1"
            >
              <Link className="w-3.5 h-3.5" /> Sync
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
