import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Check, HelpCircle } from "lucide-react";
import { SFX } from "@/lib/soundManager";
import { Haptics } from "@/lib/hapticManager";

interface ParentalGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function ParentalGateModal({
  isOpen,
  onSuccess,
  onCancel,
  title = "Parental Verification",
  subtitle = "Please solve this quick math puzzle to continue with this purchase:",
}: ParentalGateModalProps) {
  const [numA, setNumA] = useState(3);
  const [numB, setNumB] = useState(4);
  const [userAnswer, setUserAnswer] = useState("");
  const [errorShake, setErrorShake] = useState(false);

  // Generate simple math question (e.g. 4 + 7 or 6 + 8) each time opened
  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 8) + 2; // 2..9
      const b = Math.floor(Math.random() * 8) + 2; // 2..9
      setNumA(a);
      setNumB(b);
      setUserAnswer("");
      setErrorShake(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const correctAnswer = numA + numB;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(userAnswer.trim(), 10);
    if (val === correctAnswer) {
      Haptics.tap();
      SFX.tap();
      onSuccess();
    } else {
      Haptics.invalid();
      SFX.invalid();
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      setUserAnswer("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-xs bg-card border border-primary/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
          {/* Top colored accent bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-primary to-indigo-500" />

          {/* Close button */}
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="absolute top-3.5 right-3.5 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Shield Icon */}
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mt-2 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h3 className="title-font text-lg font-black text-foreground">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1 px-1 leading-relaxed">
            {subtitle}
          </p>

          {/* Math Question Box */}
          <motion.div
            animate={errorShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`w-full my-4 p-4 rounded-2xl border flex flex-col items-center justify-center ${
              errorShake
                ? "bg-rose-500/15 border-rose-500/50"
                : "bg-secondary/60 border-border"
            }`}
          >
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Question
            </span>
            <div className="text-3xl font-black text-foreground tracking-widest font-mono">
              {numA} + {numB} = ?
            </div>
            {errorShake && (
              <span className="text-[10px] text-rose-500 font-bold mt-1.5">
                Incorrect answer, please try again!
              </span>
            )}
          </motion.div>

          {/* Input & Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter answer"
              className="w-full py-3 px-4 rounded-xl bg-background border border-border text-center text-lg font-black text-foreground tracking-wider focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50 placeholder:text-sm placeholder:font-normal"
            />

            <div className="flex gap-2 w-full mt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Confirm
              </button>
            </div>
          </form>

          <span className="text-[9.5px] text-muted-foreground/60 mt-3 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Child safety protection check
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
