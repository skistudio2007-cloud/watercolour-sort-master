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
  Target,
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
        {/* Animated 3D Glass Test Tube Hero with Cyber Glow */}
        <motion.div
          initial={{ scale: 0.88, y: -8 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.45 }}
          className="relative mb-5 cursor-pointer"
          whileHover={{ scale: 1.06, rotate: [0, -2, 2, 0] }}
          onClick={() => {
            Haptics.tap();
            SFX.tap();
          }}
        >
          {/* Ambient Cyber Aura behind tube */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-purple-600/30 rounded-full blur-2xl pointer-events-none" />

          <div className="glass-test-tube w-22 h-36 relative flex flex-col justify-end p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] border-2 border-white/40 dark:border-white/20">
            {/* Tube glass rim */}
            <div className="glass-rim" />
            <div className="glass-specular-highlight" />
            <div className="glass-secondary-shine" />

            <div className="w-full h-full relative rounded-b-[1.4rem] overflow-hidden">
              {/* Bottom Liquid Layer (Vibrant Cyan-Blue with Internal Light) */}
              <motion.div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-700 via-sky-500 to-cyan-300"
                animate={{ height: ["48%", "55%", "48%"] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="liquid-inner-light" />
                {/* Floating micro-bubbles */}
                <div className="absolute w-1.5 h-1.5 bg-white/70 rounded-full left-3 bottom-2 liquid-bubble" style={{ animationDelay: "0.2s" }} />
                <div className="absolute w-2 h-2 bg-white/60 rounded-full right-4 bottom-4 liquid-bubble" style={{ animationDelay: "1.1s" }} />

                <div className="liquid-meniscus">
                  <div className="meniscus-highlight" style={{ backgroundColor: "#38BDF8" }} />
                </div>
              </motion.div>

              {/* Top Floating Liquid Layer (Vibrant Violet-Pink with Internal Light) */}
              <motion.div
                className="absolute inset-x-0 bg-gradient-to-t from-purple-700 via-fuchsia-500 to-pink-400 opacity-95"
                style={{ bottom: "48%" }}
                animate={{ height: ["35%", "29%", "35%"] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="liquid-inner-light" />
                {/* Floating micro-bubbles */}
                <div className="absolute w-1.5 h-1.5 bg-white/75 rounded-full left-4 bottom-1 liquid-bubble" style={{ animationDelay: "0.7s" }} />

                <div className="liquid-meniscus">
                  <div className="meniscus-highlight" style={{ backgroundColor: "#E879F9" }} />
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
          className="title-font text-3xl sm:text-4xl font-black text-center text-foreground tracking-tight drop-shadow-md"
        >
          {t("game_title")}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 mt-1.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <span className="mono-label text-[9.5px] uppercase text-primary font-black tracking-widest">
            {t("game_subtitle")}
          </span>
        </motion.div>
      </div>

      {/* ================= CENTER / LOWER: PLAY BUTTON & CONTINUE ================= */}
      <div className="w-full flex flex-col items-center gap-3 z-10 max-w-[340px] mx-auto mb-2">
        {/* DOMINANT CYBER NEON GLASS PLAY BUTTON */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className="hero-neon-play-btn w-full py-4 px-6 rounded-2xl text-xl flex justify-center items-center gap-3 shadow-2xl cursor-pointer"
        >
          <div className="hero-shimmer-beam" />
          <Play fill="currentColor" className="w-6 h-6 ml-0.5 drop-shadow-sm" />
          <span className="drop-shadow-sm">{t("play")}</span>
        </motion.button>

        {/* Daily & Weekly Challenges Quick Access */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            Haptics.tap();
            SFX.tap();
            navigate("challenges");
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 hover:from-amber-500/25 hover:via-purple-500/25 hover:to-cyan-500/25 border border-amber-400/30 text-xs font-black text-foreground flex items-center justify-center gap-2 shadow-md backdrop-blur-md transition-all cursor-pointer"
        >
          <Target className="w-4 h-4 text-amber-500" />
          <span>Daily & Weekly Challenges</span>
        </motion.button>

        {/* Continue Level / Progress Indicator */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            Haptics.tap();
            SFX.tap();
            navigate("levels");
          }}
          className="text-xs font-black text-muted-foreground/90 hover:text-foreground flex items-center gap-2 transition-all py-1.5 px-4 rounded-xl bg-card/40 hover:bg-card/70 border border-white/10 shadow-sm cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Continue Level {state.progress.maxUnlockedLevel}</span>
        </motion.button>

        {/* Subtle Privacy Policy link on Menu */}
        <button
          onClick={() => {
            Haptics.tap();
            SFX.tap();
            setPrivacyModalOpen(true);
          }}
          className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors -mt-0.5"
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