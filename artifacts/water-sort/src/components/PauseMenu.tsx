import React from "react";
import { useGame } from "@/contexts/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, RotateCcw, Settings, Home } from "lucide-react";

export default function PauseMenu({ onClose }: { onClose: () => void }) {
  const { navigate, handleRestart } = useGame();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col justify-end"
    >
      <div className="flex-1" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-card border-t border-border shadow-2xl rounded-t-[2rem] p-6 pb-10 safe-bottom"
      >
        <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mb-6 opacity-50" />
        
        <h2 className="text-2xl font-bold text-center mb-8">Paused</h2>
        
        <div className="flex flex-col gap-3">
          <MenuButton 
            icon={<Play className="fill-current" />} 
            label="Resume" 
            primary 
            onClick={onClose} 
          />
          <MenuButton 
            icon={<RotateCcw />} 
            label="Restart Level" 
            onClick={() => { handleRestart(); onClose(); }} 
          />
          <MenuButton 
            icon={<Settings />} 
            label="Settings" 
            onClick={() => navigate("settings")} 
          />
          <MenuButton 
            icon={<Home />} 
            label="Quit to Menu" 
            destructive
            onClick={() => navigate("menu")} 
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function MenuButton({ icon, label, primary, destructive, onClick }: any) {
  const base = "w-full py-4 rounded-2xl flex items-center px-6 gap-4 font-bold transition-transform active:scale-95";
  let style = "bg-secondary text-foreground hover:bg-secondary/80";
  if (primary) style = "bg-primary text-primary-foreground shadow-md";
  if (destructive) style = "bg-destructive/10 text-destructive hover:bg-destructive/20";
  
    return (
    <button data-testid={`button-pause-${label.toLowerCase().replaceAll(" ", "-")}`} className={`${base} min-h-[52px] ${style}`} onClick={onClick}>
      {icon}
      <span className="text-lg">{label}</span>
    </button>
  );
}
