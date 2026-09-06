import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Settings,
  Flame,
  Trophy,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";

import { useGame } from "@/contexts/GameContext";
import { loadPlayerProfile } from "@/lib/leaderboardManager";
import { loadDailyState } from "@/lib/storage";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";

export default function MenuScreen() {
  const { state, navigate, startLevel } = useGame();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const profile = loadPlayerProfile();
  const daily = loadDailyState();

  const handlePlay = () => {
    Haptics.tap();
    SFX.levelStart();
    startLevel(state.progress.maxUnlockedLevel);
  };

  const getAvatarIcon = (avatarId: string) => {
    const emojis: Record<string, string> = {
      droplet: "💧",
      crown: "👑",
      sparkles: "✨",
      trophy: "🏆",
      flask: "🧪",
      star: "⭐",
      gem: "💎",
      target: "🎯",
    };
    return emojis[avatarId] || "💧";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full min-h-full flex flex-col justify-between p-5 pb-6 select-none overflow-hidden"
    >
      {/* ================= TOP AREA: STRICT 3-COLUMN LAYOUT ================= */}
      <div className="w-full max-w-xl mx-auto flex justify-between items-start relative z-20 pt-2">
        {/* TOP-LEFT VERTICAL STACK (Profile, Shop) */}
        <div className="flex flex-col gap-2.5 items-start">
          {/* 1. Profile */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              Haptics.tap();
              SFX.tap();
              navigate("profile");
            }}
            title="Profile"
            aria-label="Profile"
            className="flex items-center gap-2 bg-card/75 backdrop-blur-xl border border-white/20 dark:border-white/10 p-2 pr-3 rounded-2xl shadow-lg hover:bg-card/90 active:scale-95 transition-all"
          >
            <span className="text-base">{getAvatarIcon(profile.avatar)}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-foreground truncate max-w-[85px]">
                {profile.name}
              </span>
              <span className="text-[8.5px] font-bold text-primary">
                #{profile.bestRank > 9000 ? "Unranked" : profile.bestRank}
              </span>
            </div>
          </motion.button>

          {/* 2. Shop */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              Haptics.tap();
              SFX.tap();
              navigate("shop");
            }}
            title="Shop"
            aria-label="Shop"
            className="w-10 h-10 rounded-2xl bg-card/75 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center text-foreground shadow-md hover:bg-card/90 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-accent" />
          </motion.button>
        </div>

        {/* TOP-RIGHT VERTICAL STACK (Settings, Leaderboard) */}
        <div className="flex flex-col gap-2.5 items-end">
          {/* Daily Streak Badge */}
          <div className="streak-pill mb-0.5">
            <Flame
              className={`w-3.5 h-3.5 ${
                daily.streak > 0
                  ? "text-orange-500 fill-orange-500 drop-shadow-sm"
                  : "text-muted-foreground"
              }`}
            />
            <span className="text-xs font-black text-foreground">
              {daily.streak}
            </span>
          </div>

          {/* 1. Settings */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              Haptics.tap();
              SFX.tap();
              navigate("settings");
            }}
            title="Settings"
            aria-label="Settings"
            className="w-10 h-10 rounded-2xl bg-card/75 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center text-foreground shadow-md hover:bg-card/90 active:scale-95 transition-all"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* 2. Leaderboard */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              Haptics.tap();
              SFX.tap();
              navigate("leaderboard");
            }}
            title="Leaderboard"
            aria-label="Leaderboard"
            className="w-10 h-10 rounded-2xl bg-card/75 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center text-foreground shadow-md hover:bg-card/90 active:scale-95 transition-all"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
          </motion.button>
        </div>
      </div>

      {/* ================= CENTER HERO ================= */}
      <div className="flex flex-col items-center z-10 my-auto py-2">
        {/* Animated 3D Glass Test Tube Logo */}
        <motion.div
          initial={{ scale: 0.88, y: -8 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative mb-5"
        >
          <div className="glass-test-tube w-20 h-32 relative flex flex-col justify-end p-1.5 shadow-2xl">
            {/* Tube glass rim */}
            <div className="glass-rim" />
            <div className="glass-specular-highlight" />

            <div className="w-full h-full relative rounded-b-[1.3rem] overflow-hidden">
              {/* Bottom Liquid Layer (Blue) */}
              <motion.div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400"
                animate={{ height: ["48%", "54%", "48%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="liquid-meniscus">
                  <div className="meniscus-highlight" style={{ backgroundColor: "#60A5FA" }} />
                </div>
              </motion.div>

              {/* Top Floating Liquid Layer (Purple) */}
              <motion.div
                className="absolute inset-x-0 bg-gradient-to-t from-purple-700 via-purple-500 to-pink-400 opacity-90"
                style={{ bottom: "48%" }}
                animate={{ height: ["34%", "28%", "34%"] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="liquid-meniscus">
                  <div className="meniscus-highlight" style={{ backgroundColor: "#C084FC" }} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="title-font text-3xl font-black text-center text-foreground tracking-tight"
        >
          {t("game_title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mono-label text-[9.5px] uppercase text-primary font-black tracking-widest mt-1"
        >
          {t("game_subtitle")}
        </motion.p>
      </div>

      {/* ================= CENTER / LOWER: PLAY BUTTON & CONTINUE ================= */}
      <div className="w-full flex flex-col items-center gap-3 z-10 max-w-[340px] mx-auto mb-2">
        {/* DOMINANT DARK GLASS PLAY BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handlePlay}
          className="primary-action w-full py-4 rounded-2xl font-black text-xl flex justify-center items-center gap-3 shadow-2xl shadow-primary/30 cursor-pointer"
        >
          <Play fill="currentColor" className="w-6 h-6 ml-0.5" />
          <span>{t("play")}</span>
        </motion.button>

        {/* Continue Level / Progress Indicator */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            Haptics.tap();
            SFX.tap();
            navigate("levels");
          }}
          className="text-xs font-bold text-muted-foreground/90 hover:text-foreground flex items-center gap-1.5 transition-colors py-1"
        >
          <span>Continue Level {state.progress.maxUnlockedLevel}</span>
        </motion.button>

        {/* Subtle Privacy Policy link on Menu */}
        <button
          onClick={() => {
            Haptics.tap();
            SFX.tap();
            setPrivacyModalOpen(true);
          }}
          className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors -mt-1"
        >
          Privacy Policy
        </button>
      </div>

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <PrivacyPolicyModal onClose={() => setPrivacyModalOpen(false)} />
      )}
    </motion.div>
  );
}