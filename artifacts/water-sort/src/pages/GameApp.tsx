import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { useSettings } from "@/contexts/SettingsContext";
import MenuScreen from "@/pages/MenuScreen";
import LevelSelectScreen from "@/pages/LevelSelectScreen";
import GameScreen from "@/pages/GameScreen";
import AchievementsScreen from "@/pages/AchievementsScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import StatsScreen from "@/pages/StatsScreen";
import ShopScreen from "@/pages/ShopScreen";
import LeaderboardScreen from "@/pages/LeaderboardScreen";
import ProfileScreen from "@/pages/ProfileScreen";
import CollectionScreen from "@/pages/CollectionScreen";
import BackgroundLayer from "@/components/BackgroundLayer";
import BottomNav from "@/components/BottomNav";
import AchievementToast from "@/components/AchievementToast";

export default function GameApp() {
  const { state } = useGame();
  const { screen, dailyStreak, pendingAchievements, dailyRewardAvailable } =
    state;

  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center items-center overflow-hidden font-sans text-foreground selection:bg-primary/20 transition-colors duration-300">
      <div className="w-full h-[100dvh] relative flex flex-col bg-background overflow-hidden">
        {/* Dynamic Fluid Background Layer */}
        <BackgroundLayer />

        <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="w-full h-full"
            >
              {screen === "menu" && <MenuScreen />}
              {screen === "levels" && <LevelSelectScreen />}
              {screen === "game" && <GameScreen />}
              {screen === "achievements" && <AchievementsScreen />}
              {screen === "settings" && <SettingsScreen />}
              {screen === "stats" && <StatsScreen />}
              {screen === "shop" && <ShopScreen />}
              {screen === "leaderboard" && <LeaderboardScreen />}
              {screen === "profile" && <ProfileScreen />}
              {screen === "collection" && <CollectionScreen />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Bottom Navigation Dock */}
        {screen !== "game" && <BottomNav />}

        {/* Global Overlays */}
        {pendingAchievements.length > 0 && (
          <AchievementToast achievement={pendingAchievements[0]} />
        )}
      </div>
    </div>
  );
}
