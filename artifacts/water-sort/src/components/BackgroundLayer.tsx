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

  // Gentle floating micro-bubbles that drift upwards slowly
  const bubbles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      size: (i % 5) * 6 + 10,
      left: `${(i * 19 + 7) % 94}%`,
      delay: (i * 0.8) % 6,
      duration: 12 + (i % 6) * 3,
      opacity: isDark ? (0.12 + (i % 4) * 0.05) : (0.2 + (i % 4) * 0.08),
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

      {/* Subtle floating ambient particles/bubbles */}
      <div className="absolute inset-0">
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: "110%", opacity: 0 }}
            animate={{
              y: "-20%",
              opacity: [0, b.opacity, b.opacity, 0],
              x: ["-10px", "10px", "-10px"],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              delay: b.delay,
              ease: "linear",
            }}
            className="absolute rounded-full pointer-events-none blur-[0.5px]"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: b.left,
              backgroundColor: activeBubbleColor,
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
