import React, { useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import Tube from "./Tube";
import PouringStream from "./PouringStream";
import { loadCosmetics } from "@/lib/storage";

export default function TubeGrid() {
  const { state, handleTubeSelect } = useGame();

  if (!state.gameState) return null;

  const { tubes, selectedTube, invalidTube, pourAnimating } = state.gameState;
  const numTubes = tubes.length;

  // Responsive column layout based on tube count
  const cols = useMemo(() => {
    if (numTubes > 12) return 5;
    if (numTubes >= 8) return 4;
    if (numTubes >= 5) return 3;
    return 3;
  }, [numTubes]);

  const cosmetics = loadCosmetics();
  const activeBottle = cosmetics.activeBottle;

  // Calculate tilt angle and directional offset toward target tube
  const { pourAngle, pourDelta } = useMemo(() => {
    if (!pourAnimating) return { pourAngle: 0, pourDelta: { x: 0, y: 0 } };
    const { from, to } = pourAnimating;
    const fromCol = from % cols;
    const toCol = to % cols;
    const fromRow = Math.floor(from / cols);
    const toRow = Math.floor(to / cols);

    const deltaCol = toCol - fromCol;
    const deltaRow = toRow - fromRow;

    // Fluid tilt angle based on horizontal relationship
    let angle = deltaCol > 0 ? 52 : deltaCol < 0 ? -52 : (from < to ? 45 : -45);

    // Dynamic travel offset (moves source container near the target container opening)
    const moveX = deltaCol * 48;
    const moveY = deltaRow * 85 - 35; // Lift up and position near mouth

    return { 
      pourAngle: angle, 
      pourDelta: { x: moveX, y: moveY } 
    };
  }, [pourAnimating, cols]);

  return (
    <div className="w-full flex justify-center items-center px-1 select-none relative">
      <div
        className="grid gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-9 md:gap-x-8 md:gap-y-10 lg:gap-x-12 lg:gap-y-12 place-items-center relative md:scale-110 lg:scale-120 origin-center transition-transform duration-200"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: "100%",
        }}
      >
        {tubes.map((tube, idx) => {
          const isSource = pourAnimating?.from === idx;
          const isTarget = pourAnimating?.to === idx;

          return (
            <Tube
              key={tube.id}
              tube={tube}
              index={idx}
              isSelected={selectedTube === idx}
              isInvalid={invalidTube === idx}
              isHintFrom={state.hintMove?.from === idx}
              isHintTo={state.hintMove?.to === idx}
              isPourSource={isSource}
              isPourTarget={isTarget}
              pourAngle={isSource ? pourAngle : 0}
              pourDelta={isSource ? pourDelta : undefined}
              pourColor={pourAnimating?.color}
              onSelect={handleTubeSelect}
              activeBottle={activeBottle}
            />
          );
        })}
      </div>

      {/* Dynamic Liquid Stream connecting source lip to destination opening */}
      {pourAnimating && (
        <PouringStream
          fromIndex={pourAnimating.from}
          toIndex={pourAnimating.to}
          color={pourAnimating.color}
          durationMs={520}
          activeBottle={activeBottle}
        />
      )}
    </div>
  );
}
