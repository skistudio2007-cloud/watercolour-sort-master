import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, X, ShieldCheck, Crown } from "lucide-react";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import { t } from "@/lib/localization";
import { loadPlayerProfile, savePlayerProfile } from "@/lib/leaderboardManager";

import { purchaseProduct, restorePurchases } from "@/lib/microsoftStoreIAP";

interface PremiumModalProps {
  onClose: () => void;
}

export default function PremiumModal({ onClose }: PremiumModalProps) {
  const [purchased, setPurchased] = useState(() => {
    try {
      return localStorage.getItem("ws2_is_premium") === "true";
    } catch {
      return false;
    }
  });
  const [restoredMsg, setRestoredMsg] = useState("");

  const handlePurchase = async () => {
    const res = await purchaseProduct("vip_master_pass");
    if (res.success) {
      Haptics.levelComplete();
      SFX.achievement();
      try {
        localStorage.setItem("ws2_is_premium", "true");
        setPurchased(true);
        const profile = loadPlayerProfile();
        profile.avatar = "crown";
        savePlayerProfile(profile);
      } catch {
        // Ignore
      }
    }
  };

  const handleRestore = () => {
    Haptics.tap();
    SFX.tap();
    const { restoredCount } = restorePurchases();
    if (restoredCount > 0) {
      setRestoredMsg(`Successfully restored ${restoredCount} Microsoft Store purchase(s)!`);
    } else {
      setRestoredMsg("Purchases are up to date!");
    }
    setTimeout(() => setRestoredMsg(""), 3500);
  };

  const perks = [
    t("remove_ads"),
    t("unlimited_hints"),
    t("unlimited_undos"),
    t("all_themes_unlocked"),
    "All Laboratory Test Tubes Unlocked",
    t("vip_badge"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-card border border-amber-400/30 dark:border-amber-400/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center"
      >
        {/* Top Gold Ribbon */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIP Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 mb-4 mt-2">
          <Crown className="w-9 h-9" />
        </div>

        <h2 className="title-font text-2xl font-black text-center text-foreground">
          VIP Master Pass
        </h2>
        <p className="text-xs text-muted-foreground text-center mt-1 mb-5">
          Unlock premium laboratory bottles and atmospheric backgrounds
        </p>

        {/* Benefits Checklist */}
        <div className="w-full bg-secondary/50 rounded-2xl p-4 flex flex-col gap-2.5 mb-5 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-foreground/90">All 10 Laboratory Test Tubes Unlocked</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-foreground/90">All 10 Atmospheric Backgrounds Unlocked</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-foreground/90">Exclusive Crown Profile Badge & Avatar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground/90">Permanent lifetime one-time unlock</span>
          </div>
        </div>

        {restoredMsg && (
          <p className="text-xs text-emerald-500 font-bold mb-3 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> {restoredMsg}
          </p>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handlePurchase}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 mb-3"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          {purchased ? "VIP PASS ACTIVATED" : "UNLOCK VIP PASS - $2.99"}
        </motion.button>

        {/* Restore Purchases */}
        <button
          onClick={handleRestore}
          className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4"
        >
          {t("restore_purchases")}
        </button>
      </motion.div>
    </motion.div>
  );
}
