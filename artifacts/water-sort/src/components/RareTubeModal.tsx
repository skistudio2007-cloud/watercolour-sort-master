import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, ShieldCheck, Gem } from "lucide-react";
import { BottleSkin, unlockBottleSkin, setActiveBottle } from "@/lib/storage";
import { purchaseProduct } from "@/lib/microsoftStoreIAP";
import BottlePreview from "@/components/BottlePreview";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";

interface RareTubeModalProps {
  bottle: {
    id: BottleSkin;
    label: string;
    desc: string;
  } | null;
  onClose: () => void;
  onUnlocked: () => void;
}

export default function RareTubeModal({
  bottle,
  onClose,
  onUnlocked,
}: RareTubeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!bottle) return null;

  const handlePurchase = async () => {
    Haptics.tap();
    SFX.tap();
    setIsProcessing(true);

    const res = await purchaseProduct(`bottle_skin_${bottle.id}`);
    if (res.success) {
      unlockBottleSkin(bottle.id);
      setActiveBottle(bottle.id);
      setIsProcessing(false);
      setSuccess(true);
      Haptics.levelComplete();
      SFX.achievement();

      setTimeout(() => {
        onUnlocked();
        onClose();
      }, 900);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-card border border-amber-400/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
          {/* Top Gold Shimmer Ribbon */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Luxury Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-3 mt-1">
            <Gem className="w-3.5 h-3.5 fill-current" />
            <span>Rare Studio Silhouette</span>
          </div>

          {/* Tube Preview Spotlight */}
          <div className="w-28 h-36 my-2 rounded-2xl bg-gradient-to-b from-secondary/80 to-secondary/30 border border-border flex items-center justify-center relative shadow-inner">
            <BottlePreview
              bottleId={bottle.id}
              className="w-14 h-28"
            />
          </div>

          <h2 className="title-font text-2xl font-black text-foreground mt-2">
            {bottle.label}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 px-4 leading-relaxed">
            {bottle.desc}
          </p>

          {/* Perks list */}
          <div className="w-full bg-secondary/40 rounded-2xl p-3.5 my-4 border border-border/50 flex flex-col gap-2 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-semibold text-foreground/90">
                Permanent lifetime access
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-semibold text-foreground/90">
                High-definition glass refraction & pouring
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-foreground/90">
                Instant VIP Unlock
              </span>
            </div>
          </div>

          {/* Purchase Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={isProcessing || success}
            onClick={handlePurchase}
            className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
              success
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-amber-500/30 hover:brightness-105"
            }`}
          >
            {success ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                UNLOCKED & EQUIPPED!
              </>
            ) : isProcessing ? (
              "PROCESSING..."
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                UNLOCK FOR $0.99
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
