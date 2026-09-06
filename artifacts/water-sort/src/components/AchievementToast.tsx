import React, { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { PendingAchievement } from "@/contexts/GameContext";

export default function AchievementToast({ achievement }: { achievement: PendingAchievement }) {
  const { dismissAchievement } = useGame();

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissAchievement(achievement.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [achievement, dismissAchievement]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: -24, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", bounce: 0.4 }}
        className="absolute bottom-0 left-4 right-4 z-50 glass-panel border-2 border-primary/20 rounded-2xl p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl shrink-0">
        {achievement.icon}
      </div>
      
      <div className="flex-1">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Achievement Unlocked</h4>
        <h3 className="text-base font-bold text-foreground leading-tight">{achievement.title}</h3>
      </div>

      <div className="shrink-0 flex flex-col items-end">
        <span className="text-xs text-muted-foreground font-medium mb-0.5">Reward</span>
        <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          Achievement Unlocked!
        </span>
      </div>

      <button 
        onClick={() => dismissAchievement(achievement.id)}
        data-testid="button-dismiss-achievement" className="absolute -top-2 -right-2 w-11 h-11 bg-secondary text-foreground rounded-full flex items-center justify-center border border-border hover:bg-muted"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
