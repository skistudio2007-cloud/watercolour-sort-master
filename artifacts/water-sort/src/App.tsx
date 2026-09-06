import { GameProvider } from "@/contexts/GameContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import GameApp from "@/pages/GameApp";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <SettingsProvider>
      <GameProvider>
        <GameApp />
        <Toaster />
      </GameProvider>
    </SettingsProvider>
  );
}
