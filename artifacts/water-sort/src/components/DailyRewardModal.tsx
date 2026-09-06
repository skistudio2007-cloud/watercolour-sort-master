import React from "react";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import { Gift, Check } from "lucide-react";

export default function DailyRewardModal() {
  const { state, claimDaily } = useGame();
  const currentStreak = state.dailyStreak; // this is the next one to claim

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-amber-400 to-orange-500 opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-black mb-2 text-center">Daily Reward</h2>
          <p className="text-muted-foreground text-center text-sm mb-6 px-4">
            Come back every day to keep your streak alive!
          </p>

          <div className="w-full grid grid-cols-4 gap-2 mb-6">
  {Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    const isPast = day < currentStreak;
    const isToday = day === currentStreak;

    return (
      <div
        key={day}
        className={`rounded-xl p-2 text-center border ${
          isToday
            ? "border-primary bg-primary/10"
            : "border-border bg-secondary/30"
        }`}
      >
        <div className="text-[10px] font-bold text-muted-foreground">
          Day {day}
        </div>

        <div className="mt-1">
          {isPast ? (
            <Check className="w-4 h-4 mx-auto text-emerald-500" />
          ) : isToday ? (
            <Gift className="w-4 h-4 mx-auto text-primary" />
          ) : (
            <span className="text-xs text-muted-foreground">•</span>
          )}
        </div>
      </div>
    );
  })}
</div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={claimDaily}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl shadow-lg shadow-orange-500/20 flex justify-center items-center"
          >
            Keep streak!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
