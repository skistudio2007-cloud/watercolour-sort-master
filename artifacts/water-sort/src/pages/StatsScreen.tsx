import React from "react";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Target, RotateCcw, Lightbulb, CheckCircle2 } from "lucide-react";
import { loadStats } from "@/lib/storage";
import { TOTAL_LEVELS } from "@/lib/levelGenerator";

export default function StatsScreen() {
  const { navigate } = useGame();
  const stats = loadStats();

  const completePercent = Math.round((stats.totalLevelsCompleted / TOTAL_LEVELS) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-full pb-8 bg-background flex flex-col"
    >
      <header className="sticky top-0 z-20 flex items-center p-4 bg-background/90 backdrop-blur-lg border-b border-border">
        <button onClick={() => navigate("menu")} className="p-2 -ml-2 rounded-full hover:bg-secondary text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">Your Stats</h1>
      </header>

      <div className="p-6 flex flex-col gap-6">
        
        {/* Progress Header */}
        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-primary/20 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 relative backdrop-blur-sm border border-white/30">
            <Trophy className="w-10 h-10 text-white drop-shadow-md" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <circle cx="40" cy="40" r="38" fill="none" stroke="white" strokeWidth="4" strokeDasharray={`${completePercent * 2.38} 238`} strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-3xl font-black mb-1">{stats.totalLevelsCompleted}</h2>
          <p className="text-white/80 font-medium text-sm uppercase tracking-wider">Levels Completed</p>
          <div className="w-full mt-6 bg-white/20 rounded-xl p-3 flex justify-between items-center backdrop-blur-md">
            <span className="font-semibold text-sm">Overall Progress</span>
            <span className="font-black">{completePercent}%</span>
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Perfect Levels" value={stats.perfectLevels} />
          <StatCard icon={<Star className="text-yellow-500" />} label="Total Pours" value={stats.totalPours.toLocaleString()} />
          <StatCard icon={<Target className="text-cyan-500" />} label="Total Moves" value={stats.totalMoves.toLocaleString()} />
          <StatCard icon={<Lightbulb className="text-purple-500" />} label="Hints Used" value={stats.totalHintsUsed} />
          <StatCard icon={<RotateCcw className="text-rose-500" />} label="Undos Used" value={stats.totalUndosUsed} />
        </div>

        {/* Global Leaderboard Button */}
        <button
          onClick={() => navigate("leaderboard")}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
        >
          <Trophy className="w-5 h-5 fill-current" />
          View Global Leaderboard
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] shadow-sm">
      <div className="bg-secondary/50 w-8 h-8 rounded-full flex items-center justify-center mb-2">
        {React.cloneElement(icon, { className: `${icon.props.className} w-4 h-4` })}
      </div>
      <div>
        <div className="text-xl font-black text-foreground">{value}</div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
