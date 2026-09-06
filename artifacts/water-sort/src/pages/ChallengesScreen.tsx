import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Check, Flame, Gift, Target } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { getDifficultyColor, getDifficultyLabel, getLevelDifficulty } from "@/lib/levelGenerator";

export default function ChallengesScreen() {
  const { state, navigate, startLevel } = useGame();
  const c = state.challenges;
  const completed = c.weeklyCompleted.length;
  return (
    <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="min-h-full bg-background pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background/85 backdrop-blur-xl border-b border-border">
        <button data-testid="button-challenges-back" aria-label="Back to menu" onClick={() => navigate("menu")} className="icon-button"><ArrowLeft /></button>
        <div className="flex items-center gap-2"><Target className="w-5 h-5 text-accent" /><h1 className="title-font text-xl font-bold">Missions</h1></div>
      </header>
      <div className="p-5 space-y-5">
        <div className="mission-hero"><div className="relative z-10"><p className="mono-label text-[10px] uppercase text-accent">Fresh every morning</p><h2 className="title-font text-3xl font-bold mt-1">Small goals.<br />Bright rewards.</h2><p className="text-sm text-foreground/65 mt-2">A focused way to keep your sorting streak alive.</p></div><Flame className="mission-flame" /></div>
        <ChallengeCard title="Daily pour" eyebrow="Today’s challenge" level={c.dailyChallengeLevelId} complete={c.dailyChallengeCompleted} onStart={() => startLevel(c.dailyChallengeLevelId)} />
        <section className="glass-panel rounded-[1.5rem] p-4">
          <div className="flex items-start justify-between mb-4"><div><p className="mono-label text-[10px] uppercase text-primary">This week</p><h3 className="font-bold text-xl mt-1">Seven shades</h3></div><span className="text-xs font-bold text-muted-foreground">{completed}/7</span></div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4"><motion.div initial={{ width: 0 }} animate={{ width: `${completed / 7 * 100}%` }} className="h-full bg-primary rounded-full" /></div>
          <div className="space-y-2">{c.weeklyChallengeIds.map((id, i) => <ChallengeRow key={id} index={i + 1} level={id} complete={c.weeklyCompleted.includes(id)} onStart={() => startLevel(id)} />)}</div>
        </section>
      </div>
    </motion.div>
  );
}

function ChallengeCard({
  title,
  eyebrow,
  level,
  complete,
  onStart
}: {
  title: string;
  eyebrow: string;
  level: number;
  complete: boolean;
  onStart: () => void;
}) {
  return (
  <motion.button
    whileTap={{ scale: .98 }}
    onClick={onStart}
    data-testid={`button-challenge-${level}`}
    className="mission-card text-left w-full"
  >
    <div>
      <p className="mono-label text-[10px] uppercase text-primary">
        {eyebrow}
      </p>

      <h3 className="title-font text-2xl font-bold mt-1">
        {title}
      </h3>

      <p className="text-xs text-muted-foreground mt-2">
        Level {level} ·{" "}
        <span style={{ color: getDifficultyColor(getLevelDifficulty(level)) }}>
          {getDifficultyLabel(getLevelDifficulty(level))}
        </span>
      </p>
    </div>

    <div className="mission-reward">
      {complete ? <Check /> : <Gift />}
    </div>
  </motion.button>
);
}
function ChallengeRow({ index, level, complete, onStart }: { index: number; level: number; complete: boolean; onStart: () => void }) {
  return <button onClick={onStart} data-testid={`button-weekly-${level}`} className="challenge-row"><span className={`challenge-number ${complete ? "done" : ""}`}>{complete ? <Check /> : index}</span><span className="flex-1 text-left"><strong>Level {level}</strong><small>{getDifficultyLabel(getLevelDifficulty(level))}</small></span><span className={complete ? "text-primary text-xs font-bold" : "text-muted-foreground text-xs"}>{complete ? "Cleared" : "Play"}</span></button>;
}