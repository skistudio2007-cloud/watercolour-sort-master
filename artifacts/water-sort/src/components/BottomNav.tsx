import React from "react";
import { motion } from "framer-motion";
import { Home, Layers, Trophy, Box, User } from "lucide-react";
import { useGame, Screen } from "@/contexts/GameContext";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";

export default function BottomNav() {
  const { state, navigate } = useGame();
  const currentScreen = state.screen;

  const navItems: { id: Screen; labelKey: string; icon: React.ReactNode }[] = [
    { id: "menu", labelKey: "home", icon: <Home className="w-6 h-6" /> },
    { id: "collection", labelKey: "collection", icon: <Box className="w-6 h-6" /> },
  ];

  const handleNav = (screen: Screen) => {
    if (screen === currentScreen) return;
    Haptics.tap();
    SFX.tap();
    navigate(screen);
  };

  return (
    <div className="w-full relative z-40 px-10 pb-3 pt-1 flex justify-center">
      <nav className="w-full max-w-[240px] bg-card/85 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.25)] flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              aria-label={t(item.labelKey)}
              title={t(item.labelKey)}
              className="relative flex-1 py-2.5 flex flex-col items-center justify-center transition-colors rounded-2xl touch-manipulation cursor-pointer"
            >
              {/* Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-primary/20 rounded-2xl border border-primary/30"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 transition-transform ${
                  isActive ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                {item.icon}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
