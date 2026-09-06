import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, CheckCircle2, Volume2, VolumeX, ShieldAlert, Sparkles } from "lucide-react";
import {
  subscribeAdModal,
  closeSimulatedAd,
  AdSimulationRequest,
} from "@/lib/adSimulator";

export default function AdMobSimulatorModal() {
  const [adRequest, setAdRequest] = useState<AdSimulationRequest | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [adFinished, setAdFinished] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAdModal((req) => {
      setAdRequest(req);
      if (req) {
        setCountdown(5);
        setCanSkip(false);
        setAdFinished(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!adRequest) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
      setAdFinished(true);
      return undefined;
    }
  }, [adRequest, countdown]);

  if (!adRequest) return null;

  const isRewarded = adRequest.type === "rewarded";

  const handleClose = () => {
    if (adFinished || canSkip) {
      if (isRewarded && adRequest.onReward) {
        adRequest.onReward();
      }
      closeSimulatedAd(true);
    } else {
      // User closed before timer ended - reward cancelled
      closeSimulatedAd(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md h-[520px] max-h-[92vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col justify-between"
        >
          {/* Top Google Test Ad Header Bar */}
          <div className="z-20 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                Google Test Ad
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {isRewarded ? "Rewarded Video" : "Interstitial"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle mute"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Countdown or Close Button */}
              {countdown > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-800 px-2.5 py-1 rounded-full text-slate-200">
                  <span>Reward in</span>
                  <span className="text-amber-400">{countdown}s</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/30 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Claim & Close</span>
                </button>
              )}

              {/* Close / Cancel (if user wants to exit early) */}
              {countdown > 0 && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Exit (No Reward)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ad Creative Video Simulation Body */}
          <div className="relative flex-1 bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Ambient Animated Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-sky-500/10 blur-3xl -top-10 -right-10 pointer-events-none animate-pulse" />
            <div className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl -bottom-10 -left-10 pointer-events-none animate-pulse" />

            {/* Simulated Sponsor Branding */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 shadow-xl shadow-sky-500/20 mb-4 flex items-center justify-center"
              >
                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
                  <Play className="w-9 h-9 text-sky-400 fill-sky-400 ml-1" />
                </div>
              </motion.div>

              <div className="flex items-center gap-1 text-sky-400 text-xs font-black tracking-wider uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" /> AdMob Official Sample Ad
              </div>

              <h2 className="title-font text-2xl font-black text-white max-w-xs leading-tight">
                Google Mobile Ads SDK
              </h2>

              <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed">
                This is a simulated AdMob rewarded test ad running in browser & desktop mode.
                {countdown > 0
                  ? ` Watch for ${countdown} seconds to receive your game reward!`
                  : " Your reward is now unlocked! Click 'Claim & Close' above or the button below."}
              </p>

              {/* Progress Bar */}
              <div className="w-64 h-2 bg-slate-800/80 rounded-full overflow-hidden mt-6 border border-slate-700/60">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  transition={{ ease: "linear", duration: 0.3 }}
                />
              </div>

              <span className="text-[10px] font-mono text-slate-400 mt-2">
                Unit ID: {adRequest.adUnitId}
              </span>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="z-20 bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white">Water Sort Puzzle</span>
              <span className="text-[10px] text-slate-400">Rewarded ad simulation</span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                adFinished
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 active:scale-95"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              }`}
            >
              {adFinished ? "COLLECT REWARD" : `SKIP IN ${countdown}s`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
