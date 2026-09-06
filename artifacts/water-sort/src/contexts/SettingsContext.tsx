// ─── Settings Context ─────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  loadSettings, saveSettings, Settings
} from "@/lib/storage";
import {
  setSfxEnabled, setMusicEnabled, setSfxVolume, setMusicVolume,
  startMusic, stopMusic
} from "@/lib/soundManager";

interface SettingsContextValue {
  settings: Settings;
  toggleDarkMode: () => void;
  toggleSfx: () => void;
  toggleMusic: () => void;
  setSfxVolumeVal: (v: number) => void;
  setMusicVolumeVal: (v: number) => void;
  toggleVibration: () => void;
  toggleColorBlind: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  // Apply dark mode class on mount and change
  useEffect(() => {
  const root = document.documentElement;

  if (settings.darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}, [settings.darkMode]);

  // Apply audio settings on mount
  useEffect(() => {
    setSfxEnabled(settings.sfxEnabled);
    setMusicEnabled(settings.musicEnabled);
    setSfxVolume(settings.sfxVolume);
    setMusicVolume(settings.musicVolume);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    updateSettings({ darkMode: !settings.darkMode });
  }, [settings.darkMode, updateSettings]);

  const toggleSfx = useCallback(() => {
    const next = !settings.sfxEnabled;
    setSfxEnabled(next);
    updateSettings({ sfxEnabled: next });
  }, [settings.sfxEnabled, updateSettings]);

  const toggleMusic = useCallback(() => {
    const next = !settings.musicEnabled;
    setMusicEnabled(next);
    if (next) startMusic(); else stopMusic();
    updateSettings({ musicEnabled: next });
  }, [settings.musicEnabled, updateSettings]);

  const setSfxVolumeVal = useCallback((v: number) => {
    setSfxVolume(v);
    updateSettings({ sfxVolume: v });
  }, [updateSettings]);

  const setMusicVolumeVal = useCallback((v: number) => {
    setMusicVolume(v);
    updateSettings({ musicVolume: v });
  }, [updateSettings]);

  const toggleVibration = useCallback(() => {
    updateSettings({ vibration: !settings.vibration });
  }, [settings.vibration, updateSettings]);

  const toggleColorBlind = useCallback(() => {
    updateSettings({ colorBlindMode: !settings.colorBlindMode });
  }, [settings.colorBlindMode, updateSettings]);

  return (
    <SettingsContext.Provider value={{
      settings, toggleDarkMode, toggleSfx, toggleMusic,
      setSfxVolumeVal, setMusicVolumeVal,
      toggleVibration, toggleColorBlind, updateSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
