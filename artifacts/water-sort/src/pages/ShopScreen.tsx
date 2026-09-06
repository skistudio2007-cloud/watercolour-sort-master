import { showRewardedAd } from "@/lib/admanager";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  ShoppingBag,
  TestTube2,
  Gem,
} from "lucide-react";

import { useGame } from "@/contexts/GameContext";
import RareTubeModal from "@/components/RareTubeModal";
import BottlePreview from "@/components/BottlePreview";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";

import {
  BOTTLE_SKINS,
  loadCosmetics,
  setActiveBottle,
  unlockBottleSkin,
  isRareBottle,
  type BottleSkin,
} from "@/lib/storage";

export default function ShopScreen() {
  const { state, navigate, refreshCosmetics } = useGame();

  const [selectedRareBottle, setSelectedRareBottle] = useState<{
    id: BottleSkin;
    label: string;
    desc: string;
  } | null>(null);

  const cosmetics = state.cosmetics;
  const items = BOTTLE_SKINS;

  const buy = (item: { id: BottleSkin; label: string; desc: string; cost?: number }) => {
    const id = item.id;
    const current = loadCosmetics();
    const owned = current.unlockedBottles.includes(id);

    // Already unlocked
    if (owned) {
      Haptics.tap();
      SFX.tap();
      setActiveBottle(id);
      refreshCosmetics();
      return;
    }

    // ==============================
    // BOTTLE / TUBE UNLOCK
    // ==============================
    const isRare = isRareBottle(id);

    if (isRare) {
      // Open $0.99 purchase modal
      Haptics.tap();
      SFX.tap();
      setSelectedRareBottle({
        id,
        label: item.label,
        desc: item.desc,
      });
      return;
    }

    // Normal bottles unlock via Rewarded Ad
    showRewardedAd(
      "bottle",
      () => {
        const unlocked = unlockBottleSkin(id);
        if (unlocked) {
          setActiveBottle(id);
          refreshCosmetics();
          console.log("[Shop] Tube unlocked via Ad");
        }
      },
      () => {
        console.log("[Shop] Tube rewarded ad failed");
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-full bg-background pb-10"
    >
      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <button
            data-testid="button-shop-back"
            aria-label="Back to menu"
            onClick={() => navigate("menu")}
            className="icon-button"
          >
            <ArrowLeft />
          </button>

          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />

            <h1 className="title-font text-xl font-bold">
              The Atelier
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <div className="p-5 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <p className="mono-label text-[10px] text-primary uppercase">
            Make the board yours
          </p>

          <h2 className="title-font text-3xl font-bold mt-1">
            A little more character.
          </h2>

          <p className="text-sm text-muted-foreground mt-2">
            Collect silhouettes and atmospheres for your next perfect pour.
          </p>
        </div>

        {/* ================= SHOP ITEMS (TUBES & SILHOUETTES) ================= */}

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const owned = cosmetics.unlockedBottles.includes(item.id);
            const active = cosmetics.activeBottle === item.id;
            const isRare = isRareBottle(item.id);

            return (
              <motion.button
                whileTap={{ scale: 0.97 }}
                key={item.id}
                data-testid={`button-shop-${item.id}`}
                onClick={() => buy(item)}
                className={`shop-card text-left relative overflow-hidden ${
                  active ? "active" : ""
                } ${isRare && !owned ? "border-amber-400/40" : ""}`}
              >
                {/* RARE RIBBON */}
                {isRare && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                    <Gem className="w-2.5 h-2.5 fill-current" />
                    <span>Rare</span>
                  </div>
                )}

                {/* PREVIEW */}
                <div className="shop-preview">
                  <BottlePreview
                    bottleId={item.id}
                    className="w-10 h-20"
                  />

                  {active && (
                    <span className="active-mark">
                      <Check />
                    </span>
                  )}
                </div>

                {/* ITEM INFO */}
                <div className="p-3">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm">
                      {item.label}
                    </span>

                    {!owned && (
                      <LockKeyhole className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {item.desc}
                  </p>

                  <div
                    className={`mt-3 text-xs font-bold ${
                      active
                        ? "text-primary"
                        : owned
                        ? "text-primary"
                        : isRare
                        ? "text-amber-400 font-black"
                        : "text-accent-foreground"
                    }`}
                  >
                    {active
                      ? "Equipped"
                      : owned
                      ? "Use this"
                      : isRare
                      ? "Unlock $0.99"
                      : "Watch Ad"}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Rare Tube Unlock Modal */}
      {selectedRareBottle && (
        <RareTubeModal
          bottle={selectedRareBottle}
          onClose={() => setSelectedRareBottle(null)}
          onUnlocked={() => {
            refreshCosmetics();
          }}
        />
      )}
    </motion.div>
  );
}