import React from "react";
import { motion } from "framer-motion";
import { Check, Gift, Sparkles, X } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

export default function RewardChestModal() {
  const { state, claimPendingChest } = useGame();
  const chest = state.pendingChest;
  if (!chest) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex items-center justify-center bg-background/80 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-chest-title"
    >
      <motion.div
        initial={{ scale: 0.8, y: 26 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-accent/30 bg-card p-7 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={claimPendingChest}
          aria-label="Close reward chest"
          className="icon-button absolute right-3 top-3 text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />

        <motion.div
          initial={{ rotate: -10, scale: 0.7 }}
          animate={{ rotate: [0, -5, 5, 0], scale: 1 }}
          transition={{ delay: 0.12, duration: 0.8, type: "spring" }}
          className="relative mx-auto mb-5 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 shadow-xl shadow-orange-500/25"
        >
          <Gift className="h-12 w-12 text-white" />
          <Sparkles className="absolute -right-3 -top-3 h-7 w-7 text-amber-300" />
        </motion.div>

        <p className="mono-label text-[10px] uppercase text-accent">Milestone unlocked</p>
        <h2 id="reward-chest-title" className="title-font mt-1 text-3xl font-bold">
          Reward Chest
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You cleared level {chest.levelId}. Here is a bonus for your streak.
        </p>

        <div className="my-6 rounded-2xl border border-accent/25 bg-accent/10 p-4">
  <div className="flex items-center justify-center gap-2 text-2xl font-black text-accent-foreground">
    🎁
  </div>
  <p className="mt-1 text-center text-xs font-semibold text-muted-foreground">
    {chest.bonusLabel}
  </p>
</div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={claimPendingChest}
          className="primary-action flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-bold"
        >
          <Check className="h-5 w-5" />
          Collect reward
        </motion.button>
      </motion.div>
    </motion.div>
  );
}