import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Color } from "@/lib/gameLogic";
import { COLOR_GRADIENT } from "@/lib/gameLogic";
import type { BottleSkin } from "@/lib/storage";
import { BOTTLE_GEOMETRIES } from "@/lib/bottleGeometries";

interface PouringStreamProps {
  fromIndex: number;
  toIndex: number;
  color: Color;
  durationMs: number;
  activeBottle?: BottleSkin;
}

interface StreamCoords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isRight: boolean;
}

export default function PouringStream({
  fromIndex,
  toIndex,
  color,
  durationMs,
  activeBottle = "classic",
}: PouringStreamProps) {
  const [coords, setCoords] = useState<StreamCoords | null>(null);
  const [bubbles, setBubbles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number; size: number }[]
  >([]);

  useEffect(() => {
    const geometry = BOTTLE_GEOMETRIES[activeBottle] || BOTTLE_GEOMETRIES.classic;

    const updatePosition = () => {
      const fromEl = document.getElementById(`tube-${fromIndex}`);
      const toEl = document.getElementById(`tube-${toIndex}`);

      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const isRight = toRect.left >= fromRect.left;

      // Calculate container-aware lip position from geometry coordinates
      const lipOffset = isRight ? geometry.pourLipRight : geometry.pourLipLeft;
      const startX = fromRect.left + fromRect.width * lipOffset.x;
      const startY = fromRect.top + fromRect.height * lipOffset.y;

      // Target container mouth opening
      const mouthOffset = geometry.targetMouthCenter;
      const endX = toRect.left + toRect.width * mouthOffset.x;
      const endY = toRect.top + toRect.height * mouthOffset.y;

      setCoords({ startX, startY, endX, endY, isRight });

      // Subtle water bubbles / tiny micro-droplets at receiving liquid surface
      const pts = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: endX + (Math.random() * 8 - 4),
        y: endY + (Math.random() * 4),
        vx: (Math.random() * 12 - 6) * (isRight ? 0.6 : -0.6),
        vy: -(Math.random() * 10 + 6),
        size: Math.random() * 2 + 1.8,
      }));
      setBubbles(pts);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 30);
    return () => clearInterval(interval);
  }, [fromIndex, toIndex, activeBottle]);

  if (!coords) return null;

  const gradient = COLOR_GRADIENT[color] || ["#5185D9", "#2E5EAF"];
  const dx = coords.endX - coords.startX;
  const dy = coords.endY - coords.startY;

  // Realistic fluid physics arc with gentle natural curve
  const midX = coords.startX + dx * 0.42;
  // Natural upward jet before cascading under gravity
  const peakY = Math.min(coords.startY, coords.endY) - 22;

  // Sinuous liquid wave path (slight organic curvature)
  const waveCtrl1X = coords.startX + dx * 0.22;
  const waveCtrl1Y = peakY + 3;
  const waveCtrl2X = coords.startX + dx * 0.72;
  const waveCtrl2Y = peakY + dy * 0.35;

  const fluidPath = `M ${coords.startX} ${coords.startY} C ${waveCtrl1X} ${waveCtrl1Y}, ${waveCtrl2X} ${waveCtrl2Y}, ${coords.endX} ${coords.endY}`;

  // Slightly thinner outer stream envelope to create realistic tapering liquid column
  const taperPath1 = `M ${coords.startX - 1.5} ${coords.startY} C ${waveCtrl1X - 2} ${waveCtrl1Y}, ${waveCtrl2X - 1} ${waveCtrl2Y}, ${coords.endX} ${coords.endY}`;
  const taperPath2 = `M ${coords.startX + 1.5} ${coords.startY} C ${waveCtrl1X + 2} ${waveCtrl1Y}, ${waveCtrl2X + 1} ${waveCtrl2Y}, ${coords.endX} ${coords.endY}`;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="pour-stream-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} stopOpacity="0.95" />
            <stop offset="50%" stopColor={gradient[0]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={gradient[1]} stopOpacity="0.95" />
          </linearGradient>

          {/* Soft water fluid filter (subtle blend, no excessive neon bloom) */}
          <filter id="fluid-softness" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Organic Tapering Liquid Stream Body (Continuous real colored water) */}
        <motion.path
          d={fluidPath}
          fill="none"
          stroke="url(#pour-stream-body)"
          strokeWidth="6.5"
          strokeLinecap="round"
          filter="url(#fluid-softness)"
          initial={{ pathLength: 0, opacity: 0.8 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
        />

        {/* 2. Secondary fluid envelope giving soft wavy liquid thickness */}
        <motion.path
          d={taperPath1}
          fill="none"
          stroke={gradient[0]}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />

        {/* 3. Delicate Surface Water Highlight (Realistic water surface reflection, NOT laser) */}
        <motion.path
          d={taperPath2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        />

        {/* 4. Subtle Concentric Fluid Ripples at Target Mouth Surface */}
        <motion.ellipse
          cx={coords.endX}
          cy={coords.endY + 2}
          rx="12"
          ry="4"
          fill="none"
          stroke={gradient[0]}
          strokeWidth="1.4"
          initial={{ scale: 0.3, opacity: 0.7 }}
          animate={{ scale: [0.3, 1.15, 1.6], opacity: [0.7, 0.3, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.ellipse
          cx={coords.endX}
          cy={coords.endY + 2}
          rx="8"
          ry="2.8"
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          initial={{ scale: 0.2, opacity: 0.6 }}
          animate={{ scale: [0.2, 1.05, 1.4], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeOut", delay: 0.18 }}
        />
      </svg>

      {/* 5. Subtle water micro-droplets & bubbles at receiving surface */}
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            initial={{
              x: b.x,
              y: b.y,
              scale: 0.8,
              opacity: 0.85,
            }}
            animate={{
              x: b.x + b.vx,
              y: b.y + b.vy,
              scale: [0.8, 1.1, 0],
              opacity: [0.85, 0.5, 0],
            }}
            transition={{
              duration: 0.38,
              repeat: Infinity,
              ease: "easeOut",
              delay: (b.id * 0.06) % 0.25,
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              backgroundColor: gradient[0],
              boxShadow: `0 1px 2px rgba(0,0,0,0.25)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
