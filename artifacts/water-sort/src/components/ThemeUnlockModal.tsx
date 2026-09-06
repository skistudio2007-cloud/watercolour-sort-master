import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { BackgroundId, unlockBackground, saveBackground, getBackgroundConfig } from "@/lib/themeManager";
import { purchaseProduct } from "@/lib/microsoftStoreIAP";
import { useSettings } from "@/contexts/SettingsContext";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";

interface ThemeUnlockModalProps {
  background: {
    id: BackgroundId;
    name: string;
    desc: string;
    gradient: string;
    lightGradient?: string;
  } | null;
  onClose: () => void;
  onUnlocked: () => void;
}

export default function ThemeUnlockModal({
  background,
  onClose,
  onUnlocked,
}: ThemeUnlockModalProps) {
  const { settings } = useSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!background) return null;

  const handlePurchase = async () => {
    Haptics.tap();
    SFX.tap();
    setIsProcessing(true);

    const res = await purchaseProduct(`bg_theme_${background.id}`);
    if (res.success) {
      unlockBackground(background.id);
      saveBackground(background.id);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="w-full max-w-sm bg-card border border-border/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
          {/* Top colored strip */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Preview Card */}
          <div
            className="w-full h-32 rounded-2xl my-3 relative overflow-hidden shadow-inner border border-border flex items-center justify-center"
            style={{
              background: settings.darkMode
                ? background.gradient
                : (background.lightGradient || background.gradient)
            }}
          >
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/20">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{background.name}</span>
            </div>
          </div>

          <h2 className="title-font text-2xl font-black text-foreground">
            {background.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 px-4 leading-relaxed">
            {background.desc}
          </p>

          <div className="w-full bg-secondary/50 rounded-2xl p-3 my-4 border border-border/50 flex flex-col gap-2 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>Permanent lifetime theme unlock</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>Instant permanent activation</span>
            </div>
          </div>

          {/* Purchase Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={isProcessing || success}
            onClick={handlePurchase}
            className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              success
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/25 hover:brightness-105"
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
                UNLOCK THEME FOR $0.49
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
