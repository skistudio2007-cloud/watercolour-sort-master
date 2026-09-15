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
    <div className="w-full relative z-40 px-10 pb-3.5 pt-1 flex justify-center">
      <nav className="cyber-glass-dock w-full max-w-[240px] p-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              aria-label={t(item.labelKey)}
              title={t(item.labelKey)}
              className="relative flex-1 py-2.5 flex flex-col items-center justify-center transition-all rounded-2xl touch-manipulation cursor-pointer cyber-action-btn"
            >
              {/* Active Pill Background with Neon Aura */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-gradient-to-r from-sky-500/25 to-indigo-500/25 rounded-2xl border border-sky-400/40 shadow-[0_0_14px_rgba(56,189,248,0.35)]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 transition-transform ${
                  isActive ? "text-sky-400 scale-110 drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]" : "text-muted-foreground/60 hover:text-muted-foreground"
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
