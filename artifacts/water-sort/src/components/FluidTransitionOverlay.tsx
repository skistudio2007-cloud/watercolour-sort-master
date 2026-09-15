import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FluidTransitionOverlayProps {
  screenKey: string;
  isInitialLoading?: boolean;
}

export default function FluidTransitionOverlay({
  screenKey,
  isInitialLoading = false,
}: FluidTransitionOverlayProps) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [screenKey]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. App Initial Boot Liquid Fill Splash */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950 pointer-events-auto"
          >
            {/* Liquid Fill Rising Wave */}
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: "100%" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative bg-gradient-to-t from-sky-600 via-cyan-500 to-teal-400 flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Dynamic Wave Meniscus Top */}
              <div className="absolute top-0 inset-x-0 h-16 -mt-8 overflow-hidden pointer-events-none">
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  className="relative block w-[200%] h-16"
                  style={{ fill: "#38BDF8" }}
                >
                  <path d="M0,0 C150,90 350,-40 500,45 C650,120 900,10 1200,50 L1200,120 L0,120 Z" />
                </svg>
              </div>

              {/* Glowing Water Sort Logo Emblem */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center gap-3 relative z-10"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">🧪</span>
                </div>
                <h1 className="title-font text-2xl font-black text-white tracking-tight drop-shadow-md">
                  Water Sort
                </h1>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">
                    Loading Fluid Physics...
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Fluid Wave Sweep on Screen Change */}
      <AnimatePresence>
        {animating && !isInitialLoading && (
          <motion.div
            key={screenKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Curved Fluid Wave Sweep with SVG path */}
            <motion.div
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: ["100%", "0%", "-100%"] }}
              transition={{ duration: 0.45, ease: [0.32, 0, 0.67, 0] }}
              className="absolute inset-0 w-full h-[140%] -top-[20%] pointer-events-none"
            >
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="w-full h-full opacity-35 dark:opacity-40"
              >
                <defs>
                  <linearGradient id="fluid-trans-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#6366F1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path
                  d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                  fill="url(#fluid-trans-grad)"
                />
              </svg>
            </motion.div>

            {/* Ripple Shockwave Ring */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-sky-400/40 pointer-events-none blur-[1px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
