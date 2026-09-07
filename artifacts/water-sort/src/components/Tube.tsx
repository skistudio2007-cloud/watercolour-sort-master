import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tube as TubeType, Color } from "@/lib/gameLogic";
import type { BottleSkin } from "@/lib/storage";
import {
  COLOR_HEX,
  COLOR_GRADIENT,
  COLOR_SYMBOLS,
  TUBE_CAPACITY,
  tubeIsComplete,
} from "@/lib/gameLogic";
import { useSettings } from "@/contexts/SettingsContext";
import { BOTTLE_GEOMETRIES } from "@/lib/bottleGeometries";

interface TubeProps {
  tube: TubeType;
  index: number;
  isSelected: boolean;
  isInvalid: boolean;
  isHintFrom: boolean;
  isHintTo: boolean;
  isPourSource: boolean;
  isPourTarget: boolean;
  pourAngle: number; // in degrees, e.g. 52 or -52
  pourDelta?: { x: number; y: number };
  pourColor?: Color;
  activeBottle?: BottleSkin;
  onSelect: (idx: number) => void;
}

export default function Tube({
  tube,
  index,
  isSelected,
  isInvalid,
  isHintFrom,
  isHintTo,
  isPourSource,
  isPourTarget,
  pourAngle,
  pourDelta,
  pourColor,
  activeBottle = "classic",
  onSelect,
}: TubeProps) {
  const { settings } = useSettings();
  const isDark = settings.darkMode;
  const isComplete = tubeIsComplete(tube) && tube.colors.length > 0;
  const topColor = tube.colors.length > 0 ? tube.colors[tube.colors.length - 1] : null;

  const geometry = BOTTLE_GEOMETRIES[activeBottle] || BOTTLE_GEOMETRIES.classic;

  // Segment calculation combining adjacent contiguous color blocks
  const segments = useMemo(() => {
    const segs: { color: Color; height: number; startIdx: number; size: number }[] = [];
    if (tube.colors.length === 0) return segs;

    let currentColor = tube.colors[0];
    let currentSize = 1;
    let startIdx = 0;

    for (let i = 1; i < tube.colors.length; i++) {
      if (tube.colors[i] === currentColor) {
        currentSize++;
      } else {
        segs.push({
          color: currentColor,
          height: (currentSize / TUBE_CAPACITY) * 100,
          startIdx,
          size: currentSize,
        });
        currentColor = tube.colors[i];
        currentSize = 1;
        startIdx = i;
      }
    }
    segs.push({
      color: currentColor,
      height: (currentSize / TUBE_CAPACITY) * 100,
      startIdx,
      size: currentSize,
    });

    return segs;
  }, [tube.colors]);

  // Motion sequence:
  // 1. Source lifts and rotates toward target smoothly
  // 2. Holds position during stream transfer
  // 3. Returns smoothly to its original position
  const tubeAnimation = useMemo(() => {
    if (isPourSource) {
      const targetX = pourDelta ? pourDelta.x : 0;
      const targetY = pourDelta ? pourDelta.y : -32;

      return {
        x: [0, targetX * 0.45, targetX, targetX, 0],
        y: [-22, targetY - 14, targetY, targetY, 0],
        scale: [1, 1.04, 1.05, 1.05, 1],
        rotate: [0, pourAngle * 0.4, pourAngle, pourAngle, 0],
        transition: {
          duration: 0.88,
          times: [0, 0.28, 0.46, 0.76, 1],
          ease: [0.25, 1, 0.35, 1],
        },
      };
    }
    if (isSelected) {
      return {
        x: 0,
        y: -22,
        scale: 1.04,
        rotate: 0,
        transition: { type: "spring", stiffness: 380, damping: 24 },
      };
    }
    if (isInvalid) {
      return {
        x: [-4, 4, -3, 3, -1, 1, 0],
        y: 0,
        scale: 1,
        rotate: 0,
        transition: { duration: 0.35, ease: "easeInOut" },
      };
    }
    return {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    };
  }, [isSelected, isInvalid, isPourSource, pourAngle, pourDelta]);

  // Unique clip-path ID for SVG cavity
  const clipId = `cavity-clip-${index}`;

  return (
    <motion.div
      id={`tube-${index}`}
      className="relative flex flex-col items-center justify-end cursor-pointer touch-manipulation select-none"
      onClick={() => onSelect(index)}
      animate={tubeAnimation as any}
      style={{
        width: "56px",
        height: "172px",
        transformOrigin: pourAngle > 0 ? "75% 15%" : "25% 15%",
        zIndex: isPourSource ? 40 : isSelected ? 30 : 10,
      }}
    >
      {/* Selected Ambient Glow (Soft, controlled, non-neon) */}
      <AnimatePresence>
        {isSelected && topColor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full blur-xl pointer-events-none"
            style={{ backgroundColor: COLOR_HEX[topColor] }}
          />
        )}
      </AnimatePresence>

      {/* Target Pour Subtle Ring */}
      <AnimatePresence>
        {isPourTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 0.35, scale: 1.04 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 rounded-[1.8rem] border border-white/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Completed Tube Subtle Halo & Sparkle */}
      <AnimatePresence>
        {isComplete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-1 rounded-[2rem] pointer-events-none"
              style={{
                boxShadow: `0 0 14px ${topColor ? COLOR_HEX[topColor] + "55" : "rgba(255,255,255,0.25)"}`,
              }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute -top-3 -right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] shadow-sm z-30 pointer-events-none font-bold"
            >
              ✦
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hint Pulse Ring */}
      <AnimatePresence>
        {(isHintFrom || isHintTo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 0.7, 0.25], scale: [0.98, 1.03, 0.98] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -inset-1.5 rounded-[1.8rem] border pointer-events-none z-20 ${
              isHintFrom ? "border-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.35)]" : "border-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.35)]"
            }`}
          />
        )}
      </AnimatePresence>

      {/* ── PREMIUM VECTOR GLASS CONTAINER ───────────────────────────────── */}
      <div className="w-full h-full relative overflow-visible">
        <svg
          viewBox="0 0 60 180"
          className="w-full h-full overflow-visible drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* SVG Cavity ClipPath for Liquid Layers */}
            <clipPath id={clipId}>
              <path d={geometry.innerCavityPath} />
            </clipPath>

            {/* Transparent Glass Backing Gradient (Adaptive for Dark / Light Mode) */}
            <linearGradient id={`glass-bg-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#0E1926" stopOpacity="0.55" />
                  <stop offset="35%" stopColor="#08101A" stopOpacity="0.32" />
                  <stop offset="65%" stopColor="#08101A" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#0E1926" stopOpacity="0.55" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                  <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.75" />
                </>
              )}
            </linearGradient>

            {/* Subtle Glass Specular Reflection - Soft, Not Blinding */}
            <linearGradient id="glass-specular" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Delicate Soft Glow for Outline */}
            <filter id="soft-glow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Transparent See-Through Glass Background */}
          <path
            d={geometry.outlinePath}
            fill={`url(#glass-bg-${index})`}
            stroke="none"
          />

          {/* 2. Liquid Contents (Clipped strictly to container cavity) */}
          <g clipPath={`url(#${clipId})`}>
            {/* Clean subtle cavity tint for empty tubes */}
            {tube.colors.length === 0 && (
              <rect x="0" y="0" width="60" height="180" fill={isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)"} />
            )}

            <AnimatePresence initial={false}>
              {segments.map((seg, i) => {
                const cavityTop = 16;
                const cavityBottom = 168;
                const cavityH = cavityBottom - cavityTop;

                const bottomPercent = seg.startIdx / TUBE_CAPACITY;
                const heightPercent = seg.height / 100;

                const segY = cavityBottom - (bottomPercent + heightPercent) * cavityH;
                const segH = heightPercent * cavityH;

                const gradient = COLOR_GRADIENT[seg.color] || ["#3B82F6", "#1D4ED8"];
                const isTop = i === segments.length - 1;

                return (
                  <g key={`${index}-${seg.startIdx}-${seg.color}`}>
                    <defs>
                      <linearGradient id={`liq-${index}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={gradient[0]} stopOpacity="1" />
                        <stop offset="100%" stopColor={gradient[1]} stopOpacity="1" />
                      </linearGradient>
                    </defs>

                    {/* Liquid Block with smooth fluid rising/decreasing interpolation */}
                    <motion.rect
                      x="0"
                      initial={{
                        y: isPourTarget && isTop ? cavityBottom - bottomPercent * cavityH : segY,
                        height: isPourTarget && isTop ? 0 : segH,
                      }}
                      animate={{
                        y: segY,
                        height: segH,
                      }}
                      exit={{
                        y: cavityBottom - bottomPercent * cavityH,
                        height: 0,
                        opacity: 0,
                        transition: { duration: 0.45, ease: [0.25, 1, 0.35, 1] },
                      }}
                      transition={{
                        y: {
                          duration: isPourTarget && isTop ? 0.52 : 0.42,
                          delay: isPourTarget && isTop ? 0.16 : 0,
                          ease: [0.25, 1, 0.35, 1],
                        },
                        height: {
                          duration: isPourTarget && isTop ? 0.52 : 0.42,
                          delay: isPourTarget && isTop ? 0.16 : 0,
                          ease: [0.25, 1, 0.35, 1],
                        },
                      }}
                      width="60"
                      fill={`url(#liq-${index}-${i})`}
                    />

                    {/* Crisp separator line between liquid blocks for distinct layer visibility */}
                    {i > 0 && (
                      <g>
                        <line
                          x1="4"
                          y1={segY + segH}
                          x2="56"
                          y2={segY + segH}
                          stroke="#FFFFFF"
                          strokeOpacity="0.5"
                          strokeWidth="1.2"
                        />
                        <line
                          x1="4"
                          y1={segY + segH + 0.8}
                          x2="56"
                          y2={segY + segH + 0.8}
                          stroke="#000000"
                          strokeOpacity="0.25"
                          strokeWidth="0.8"
                        />
                      </g>
                    )}

                    {/* Smooth Horizontal Meniscus Surface at Top of Liquid */}
                    {isTop && (
                      <g>
                        <ellipse
                          cx="30"
                          cy={segY}
                          rx="24"
                          ry="2.8"
                          fill={gradient[0]}
                        />
                        {/* Soft surface highlight on liquid surface */}
                        <ellipse
                          cx="30"
                          cy={segY - 0.5}
                          rx="18"
                          ry="1.4"
                          fill="#FFFFFF"
                          fillOpacity="0.38"
                        />
                      </g>
                    )}

                    {/* Reacting Ripples on Target Receiving Surface */}
                    {isPourTarget && isTop && (
                      <motion.ellipse
                        cx="30"
                        cy={segY}
                        rx="16"
                        ry="2"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="0.8"
                        initial={{ scale: 0.4, opacity: 0.6 }}
                        animate={{ scale: [0.4, 1.3, 1.7], opacity: [0.6, 0.25, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}

                    {/* Accessibility Symbol */}
                    {settings.colorBlindMode && (
                      <text
                        x="30"
                        y={segY + segH / 2 + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="800"
                        opacity="0.95"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                      >
                        {COLOR_SYMBOLS[seg.color]}
                      </text>
                    )}
                  </g>
                );
              })}
            </AnimatePresence>

            {/* Subtle Vertical Internal Light Reflection (Gentle, Not Fluorescent) */}
            <rect
              x="14"
              y="16"
              width="5"
              height="150"
              fill="url(#glass-specular)"
              opacity="0.16"
              pointerEvents="none"
            />
          </g>

          {/* 3. Subtle Vertical Specular Glass Highlight */}
          <path
            d="M 16 20 L 16 160"
            stroke="url(#glass-specular)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            pointerEvents="none"
            opacity="0.45"
          />
          {/* 3.5 Subtle measurement ticks for clear capacity gauge */}
          <g opacity={isDark ? "0.45" : "0.35"} pointerEvents="none">
            <line x1="8" y1="54" x2="14" y2="54" stroke={isDark ? "#FFFFFF" : "#000000"} strokeWidth="1" strokeLinecap="round" />
            <line x1="8" y1="92" x2="16" y2="92" stroke={isDark ? "#FFFFFF" : "#000000"} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="8" y1="130" x2="14" y2="130" stroke={isDark ? "#FFFFFF" : "#000000"} strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* 4. Crisp Outer Glass Outline (Adaptive for Dark / Light Mode) */}
          <path
            d={geometry.outlinePath}
            fill="none"
            stroke={isDark ? "rgba(255, 255, 255, 0.92)" : "rgba(12, 28, 48, 0.85)"}
            strokeWidth={isDark ? "2.2" : "2.4"}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#soft-glow)"
            pointerEvents="none"
          />

          {/* 5. Opening Rim (Adaptive for Dark / Light Mode) */}
          <path
            d={geometry.rimPath}
            fill={isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(12, 28, 48, 0.08)"}
            stroke={isDark ? "rgba(255, 255, 255, 0.94)" : "rgba(12, 28, 48, 0.90)"}
            strokeWidth="2.0"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        </svg>
      </div>
    </motion.div>
  );
}
