import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Undo2, X, Check, Sparkles, Zap } from "lucide-react";
import { addHints, addUndos } from "@/lib/inventoryManager";
import { purchaseProduct } from "@/lib/microsoftStoreIAP";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";
import ParentalGateModal from "./ParentalGateModal";

interface PurchasePowerUpModalProps {
  type: "hint" | "undo";
  onClose: () => void;
  onPurchased: () => void;
}

export default function PurchasePowerUpModal({
  type,
  onClose,
  onPurchased,
}: PurchasePowerUpModalProps) {
  const [purchasingPack, setPurchasingPack] = useState<number | null>(null);
  const [successPack, setSuccessPack] = useState<number | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<{ quantity: number; price: number } | null>(null);

  const isHint = type === "hint";
  const title = isHint ? "Out of Hints!" : "Out of Undos!";
  const itemName = isHint ? "Hint" : "Undo";
  const icon = isHint ? (
    <Lightbulb className="w-9 h-9 text-amber-400 fill-amber-400" />
  ) : (
    <Undo2 className="w-9 h-9 text-sky-400" />
  );

  const onSelectPack = (quantity: number, price: number) => {
    Haptics.tap();
    SFX.tap();
    // Open parental math gate before charging real payment
    setPendingPurchase({ quantity, price });
  };

  const executeConfirmedBuy = async (quantity: number, price: number) => {
    setPendingPurchase(null);
    setPurchasingPack(quantity);

    const prodId = isHint
      ? quantity === 1
        ? "hints_pack_1"
        : "hints_pack_10"
      : quantity === 1
      ? "undos_pack_1"
      : "undos_pack_10";

    const res = await purchaseProduct(prodId);

    if (res.success) {
      if (isHint) {
        addHints(quantity);
      } else {
        addUndos(quantity);
      }
      setPurchasingPack(null);
      setSuccessPack(quantity);
      Haptics.levelComplete();
      SFX.achievement();

      setTimeout(() => {
        onPurchased();
        onClose();
      }, 700);
    } else {
      setPurchasingPack(null);
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
          {/* Top highlight ribbon */}
          <div
            className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
              isHint
                ? "from-amber-400 via-yellow-300 to-amber-500"
                : "from-sky-400 via-indigo-400 to-sky-500"
            }`}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center my-3 border ${
              isHint
                ? "bg-amber-500/15 border-amber-400/30"
                : "bg-sky-500/15 border-sky-400/30"
            }`}
          >
            {icon}
          </div>

          <h2 className="title-font text-2xl font-black text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 px-4 leading-relaxed">
            You used all starting 5 free {itemName.toLowerCase()}s. Top up now to continue solving!
          </p>

          {/* Offer packs */}
          <div className="w-full flex flex-col gap-3 my-4">
            {/* Single pack: 1 item for $0.10 */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPack(1, 0.10)}
              className="w-full p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border font-black text-sm">
                  1x
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    1 {itemName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Instant single rescue
                  </span>
                </div>
              </div>

              <button
                disabled={purchasingPack !== null}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md"
              >
                {successPack === 1
                  ? "✓ Done"
                  : purchasingPack === 1
                  ? "..."
                  : "$0.10"}
              </button>
            </motion.div>

            {/* Mega pack: 10 items for $0.99 (Best Value) */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPack(10, 0.99)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border-2 border-amber-400/50 flex items-center justify-between cursor-pointer relative shadow-md transition-all"
            >
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                Best Value
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-sm">
                  10x
                </div>
                <div>
                  <span className="font-black text-sm text-foreground flex items-center gap-1">
                    10 {itemName}s
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </span>
                  <span className="text-[10px] text-amber-500 font-semibold">
                    Save money & play non-stop
                  </span>
                </div>
              </div>

              <button
                disabled={purchasingPack !== null}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
              >
                {successPack === 10
                  ? "✓ Done"
                  : purchasingPack === 10
                  ? "..."
                  : "$0.99"}
              </button>
            </motion.div>
          </div>

          <span className="text-[10px] text-muted-foreground/70">
            Secure Microsoft Store In-App Billing
          </span>
        </motion.div>
      </div>

      {/* Parental Math Verification Modal */}
      <ParentalGateModal
        isOpen={pendingPurchase !== null}
        onSuccess={() => {
          if (pendingPurchase) {
            executeConfirmedBuy(pendingPurchase.quantity, pendingPurchase.price);
          }
        }}
        onCancel={() => setPendingPurchase(null)}
        title="Parental Verification"
        subtitle={`Please solve this math question before purchasing ${pendingPurchase?.quantity} ${itemName}${pendingPurchase?.quantity === 1 ? "" : "s"}:`}
      />
    </AnimatePresence>
  );
}
