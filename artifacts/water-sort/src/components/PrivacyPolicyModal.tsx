import React from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Lock, Eye, Database, HelpCircle } from "lucide-react";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export default function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  const handleClose = () => {
    Haptics.tap();
    SFX.tap();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="w-full max-w-sm max-h-[85vh] bg-card border border-white/20 dark:border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden text-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">Privacy Policy</h2>
              <p className="text-[10px] text-muted-foreground">Colour Water Sort · Puzzle Game</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3.5 pr-1 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
          <section className="bg-secondary/40 rounded-2xl p-3 border border-border/40">
            <div className="flex items-center gap-1.5 text-foreground font-bold mb-1">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>1. Overview</span>
            </div>
            <p className="text-[11px]">
              We value your privacy. This game is built for pure logical puzzle entertainment. We do not sell your personal data or track sensitive personal information.
            </p>
          </section>

          <section className="bg-secondary/40 rounded-2xl p-3 border border-border/40">
            <div className="flex items-center gap-1.5 text-foreground font-bold mb-1">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>2. In-App Purchases (Microsoft Store)</span>
            </div>
            <p className="text-[11px] mb-1.5">
              Optional in-game items (such as Hints, Undos, Rare Bottle designs, and Atmospheric Backgrounds) are securely processed through the official <strong>Microsoft Store Commerce platform</strong>.
            </p>
            <p className="text-[11px]">
              We do not collect, store, or process any payment or financial information directly. All transactions adhere strictly to the Microsoft Privacy Statement and Microsoft Store Terms of Sale.
            </p>
          </section>

          <section className="bg-secondary/40 rounded-2xl p-3 border border-border/40">
            <div className="flex items-center gap-1.5 text-foreground font-bold mb-1">
              <Database className="w-3.5 h-3.5 text-primary" />
              <span>3. Data Storage & Local Progress</span>
            </div>
            <p className="text-[11px]">
              Game levels, unlocked themes, bottle styles, audio settings, and player stats are stored locally on your Windows device using secure client-side storage. No personal data is transmitted or sold.
            </p>
          </section>

          <section className="bg-secondary/40 rounded-2xl p-3 border border-border/40">
            <div className="flex items-center gap-1.5 text-foreground font-bold mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>4. Contact & App Preferences</span>
            </div>
            <p className="text-[11px]">
              This policy is designed for Microsoft Store compliance. You can manage in-app purchase preferences and account controls anytime through your Windows Settings or Microsoft Account portal.
            </p>
          </section>
        </div>

        {/* Footer OK button */}
        <div className="pt-2 border-t border-border/70">
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs shadow-md shadow-primary/25 active:scale-96 transition-all"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
