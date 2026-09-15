import React from "react";
import type { BottleSkin } from "@/lib/storage";
import { BOTTLE_GEOMETRIES } from "@/lib/bottleGeometries";

interface BottlePreviewProps {
  bottleId: BottleSkin;
  className?: string;
  liquidColor?: string; // Hex color or gradient start
  liquidColorBottom?: string;
}

export default function BottlePreview({
  bottleId,
  className = "w-11 h-24",
  liquidColor = "#5185D9",
  liquidColorBottom = "#2E5EAF",
}: BottlePreviewProps) {
  const geometry = BOTTLE_GEOMETRIES[bottleId] || BOTTLE_GEOMETRIES.classic;
  const clipId = `preview-clip-${bottleId}-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 60 180"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={geometry.innerCavityPath} />
          </clipPath>

          <linearGradient id={`preview-liquid-${clipId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={liquidColor} />
            <stop offset="100%" stopColor={liquidColorBottom} />
          </linearGradient>

          <linearGradient id={`preview-glass-${clipId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0E1926" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#08101A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0E1926" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id={`preview-specular-${clipId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Dark Transparent Glass Backing */}
        <path d={geometry.outlinePath} fill={`url(#preview-glass-${clipId})`} stroke="none" />

        {/* Liquid filled halfway up */}
        <g clipPath={`url(#${clipId})`}>
          {/* Inner cavity dark tint */}
          <rect x="0" y="0" width="60" height="180" fill="rgba(6, 16, 26, 0.4)" />

          {/* Liquid block from y=80 to y=168 */}
          <rect
            x="0"
            y="76"
            width="60"
            height="95"
            fill={`url(#preview-liquid-${clipId})`}
          />

          {/* Meniscus */}
          <ellipse
            cx="30"
            cy="76"
            rx="24"
            ry="3"
            fill={liquidColor}
            opacity="0.9"
            filter="brightness(1.25)"
          />

          {/* Liquid vertical shine */}
          <rect
            x="14"
            y="76"
            width="5"
            height="92"
            fill={`url(#preview-specular-${clipId})`}
            opacity="0.3"
          />
        </g>

        {/* Subtle glass reflection streak */}
        {geometry.specularPath && (
          <path
            d={geometry.specularPath}
            stroke={`url(#preview-specular-${clipId})`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            pointerEvents="none"
            opacity="0.55"
          />
        )}

        {/* Clean crisp white outline */}
        <path
          d={geometry.outlinePath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.94)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          pointerEvents="none"
        />

        {/* Clean white opening rim */}
        <path
          d={geometry.rimPath}
          fill="rgba(255, 255, 255, 0.18)"
          stroke="rgba(255, 255, 255, 0.96)"
          strokeWidth="2.2"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}
