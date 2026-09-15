import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBackgroundConfig, BackgroundId, getSavedBackground } from "@/lib/themeManager";
import { useSettings } from "@/contexts/SettingsContext";

interface BackgroundLayerProps {
  backgroundId?: BackgroundId;
}

export default function BackgroundLayer({ backgroundId }: BackgroundLayerProps) {
  const { settings } = useSettings();
  const isDark = settings.darkMode;
  const [currentBg, setCurrentBg] = useState<BackgroundId>(() => backgroundId || getSavedBackground());

  useEffect(() => {
    if (backgroundId) {
      setCurrentBg(backgroundId);
    }
  }, [backgroundId]);

  useEffect(() => {
    const handleBgChange = (e: any) => {
      if (e.detail) {
        setCurrentBg(e.detail);
      } else {
        setCurrentBg(getSavedBackground());
      }
    };
    window.addEventListener("ws2_bg_change", handleBgChange);
    return () => window.removeEventListener("ws2_bg_change", handleBgChange);
  }, []);

  const config = getBackgroundConfig(currentBg);
  const activeGradient = isDark ? config.gradient : config.lightGradient;
  const activeBubbleColor = isDark ? config.bubbleColor : config.lightBubbleColor;

  // 18 Animated Translucent Water Bubbles with realistic glass highlights
  const bubbles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: 14 + (i % 6) * 8, // 14px to 54px
      left: `${(i * 17 + 5) % 92}%`,
      delay: (i * 0.6) % 7,
      duration: 10 + (i % 5) * 3,
      sway: (i % 2 === 0 ? 1 : -1) * (12 + (i % 4) * 6),
      opacity: isDark ? 0.15 + (i % 4) * 0.05 : 0.45 + (i % 4) * 0.1,
    }));
  }, [isDark]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background Gradient with smooth crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBg}-${isDark ? "dark" : "light"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: activeGradient }}
        />
      </AnimatePresence>

      {/* Ambient Moving Aurora Waves (Subtle Dynamic Depth Behind Tubes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft cyan water light orb */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[380px] h-[380px] rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-[95px]"
        />

        {/* Soft violet pastel orb */}
        <motion.div
          animate={{
            x: [0, -45, 30, 0],
            y: [0, 40, -25, 0],
            scale: [1, 0.92, 1.12, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] -right-[15%] w-[420px] h-[420px] rounded-full bg-purple-400/12 dark:bg-purple-600/15 blur-[105px]"
        />

        {/* Soft warm amber emerald shimmer orb */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] left-[25%] w-[340px] h-[340px] rounded-full bg-teal-300/15 dark:bg-teal-500/10 blur-[90px]"
        />
      </div>

      {/* Floating Realistic Water Bubbles with Glass Reflections */}
      <div className="absolute inset-0">
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: "110%", opacity: 0 }}
            animate={{
              y: "-25%",
              opacity: [0, b.opacity, b.opacity, 0],
              x: [0, b.sway, -b.sway, 0],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              delay: b.delay,
              ease: "easeInOut",
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: b.left,
              background: isDark
                ? "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, rgba(56,189,248,0.15) 50%, rgba(14,165,233,0.05) 100%)"
                : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.7) 45%, rgba(186,230,253,0.35) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1.2px solid rgba(255,255,255,0.85)",
              boxShadow: isDark
                ? "inset 0 1px 3px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.2)"
                : "inset 0 2px 4px rgba(255,255,255,1), 0 6px 16px rgba(14,165,233,0.12)",
              backdropFilter: "blur(2px)",
            }}
          >
            {/* Top-left specular glint inside bubble */}
            <div className="absolute top-[18%] left-[20%] w-[28%] h-[24%] rounded-full bg-white/90 blur-[0.3px]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
