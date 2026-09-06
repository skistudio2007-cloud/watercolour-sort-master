import React from "react";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { loadAchievements } from "@/lib/storage";

export default function AchievementsScreen() {
  const { navigate } = useGame();
  
  const savedState = loadAchievements();
  
  const categories = [
    { id: "progress", label: "Progress" },
    { id: "skill", label: "Skill" },
    { id: "collection", label: "Collection" },
  ] as const;

  const unlockedCount = Object.keys(savedState.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-full pb-8 bg-background flex flex-col"
    >
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center">
          <button onClick={() => navigate("menu")} className="p-2 -ml-2 rounded-full hover:bg-secondary text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-2">Trophies</h1>
        </div>
        <div className="text-sm font-bold bg-secondary px-3 py-1 rounded-full text-primary">
          {unlockedCount} / {totalCount}
        </div>
      </header>

      <div className="p-4 flex flex-col gap-8">
        
        {/* Progress Bar */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Overall Completion</span>
            <span className="text-primary">{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        {categories.map(cat => {
          const acts = ACHIEVEMENTS.filter(a => a.category === cat.id);
          if (acts.length === 0) return null;
          
          return (
            <div key={cat.id} className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-2">
                {cat.label}
              </h2>
              <div className="flex flex-col gap-3">
                {acts.map(a => {
                  const unlocked = !!savedState.unlocked[a.id];
                  const isSecretLocked = a.secret && !unlocked;
                  
                  return (
                    <div 
                      key={a.id} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        unlocked ? 'bg-card border-primary/30 shadow-sm' : 'bg-secondary/30 border-transparent opacity-70'
                      }`}
                    >
                      <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-2xl ${
                        unlocked ? 'bg-primary/10 drop-shadow-sm' : 'bg-secondary'
                      }`}>
                        {isSecretLocked ? <Lock className="w-6 h-6 text-muted-foreground/50" /> : a.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold truncate ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {isSecretLocked ? "Secret Trophy" : a.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {isSecretLocked ? "Keep playing to discover this." : a.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end justify-center pl-2">
                        {unlocked && (
  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
    <span className="text-[10px]">✓</span>
  </div>
)}

              
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
      </div>
    </motion.div>
  );
}
