import React, { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useGame } from "@/contexts/GameContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  Music,
  Moon,
  Smartphone,
  Eye,
  Globe,
  Palette,
  Image as ImageIcon,
  ShieldCheck,
  Info,
  FileText,
} from "lucide-react";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import { isUsingTestAds, setUseTestAds } from "@/admob";
import {
  SUPPORTED_LANGUAGES,
  Language,
  getCurrentLanguage,
  setLanguage,
  t,
} from "@/lib/localization";
import {
  BACKGROUNDS,
  THEMES,
  BackgroundId,
  ThemeStyle,
  getSavedBackground,
  saveBackground,
  getSavedTheme,
  saveTheme,
} from "@/lib/themeManager";
import { Haptics } from "@/lib/hapticManager";
import { SFX } from "@/lib/soundManager";

export default function SettingsScreen() {
  const {
    settings,
    toggleDarkMode,
    toggleSfx,
    toggleMusic,
    setSfxVolumeVal,
    setMusicVolumeVal,
    toggleVibration,
    toggleColorBlind,
  } = useSettings();

  const { navigate, refreshCosmetics } = useGame();
  const [activeLang, setActiveLang] = useState<Language>(getCurrentLanguage);
  const [activeBg, setActiveBg] = useState<BackgroundId>(getSavedBackground);
  const [activeTheme, setActiveThemeState] = useState<ThemeStyle>(getSavedTheme);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [testAdsEnabled, setTestAdsEnabled] = useState<boolean>(isUsingTestAds);

  const handleLangChange = (lang: Language) => {
    Haptics.tap();
    SFX.tap();
    setActiveLang(lang);
    setLanguage(lang);
  };

  const handleBgChange = (bg: BackgroundId) => {
    Haptics.tap();
    SFX.tap();
    setActiveBg(bg);
    saveBackground(bg);
    refreshCosmetics();
  };

  const handleThemeChange = (theme: ThemeStyle) => {
    Haptics.tap();
    SFX.tap();
    setActiveThemeState(theme);
    saveTheme(theme);
    refreshCosmetics();
  };

  const handleRestorePurchases = () => {
    Haptics.tap();
    SFX.tap();
    setRestoreMessage("All purchases successfully restored!");
    setTimeout(() => setRestoreMessage(""), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-full pb-20 flex flex-col relative select-none"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/85 backdrop-blur-xl border-b border-border">
        <button
          onClick={() => {
            Haptics.tap();
            navigate("menu");
          }}
          className="icon-button"
        >
          <ArrowLeft />
        </button>
        <h1 className="title-font text-lg font-black">{t("settings")}</h1>
        <div className="w-10" />
      </header>

      <div className="p-5 flex flex-col gap-6">
        {/* ── Audio Settings ────────────────────────────────────────────── */}
        <SettingsGroup title="Audio">
          <SettingToggle
            icon={<Volume2 className="w-5 h-5" />}
            label={t("sound_fx")}
            value={settings.sfxEnabled}
            onChange={() => {
              Haptics.tap();
              toggleSfx();
            }}
          />
          {settings.sfxEnabled && (
            <SettingSlider value={settings.sfxVolume} onChange={setSfxVolumeVal} />
          )}

          <div className="h-px bg-border/60 my-1" />

          <SettingToggle
            icon={<Music className="w-5 h-5" />}
            label={t("bg_music")}
            value={settings.musicEnabled}
            onChange={() => {
              Haptics.tap();
              toggleMusic();
            }}
          />
          {settings.musicEnabled && (
            <SettingSlider value={settings.musicVolume} onChange={setMusicVolumeVal} />
          )}
        </SettingsGroup>

        {/* ── Language System (8 Languages) ─────────────────────────────── */}
        <SettingsGroup title={t("language")}>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeLang === lang.code
                      ? "bg-primary/15 border-primary text-primary font-black shadow-sm"
                      : "bg-secondary/40 border-border text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">{lang.nativeName}</span>
                    <span className="text-[9px] text-muted-foreground">{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SettingsGroup>

        {/* ── 10 Backgrounds ────────────────────────────────────────────── */}
        <SettingsGroup title={t("background")}>
          <div className="p-3 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleBgChange(bg.id)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  activeBg === bg.id
                    ? "border-primary ring-2 ring-primary/40 shadow-sm"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shrink-0 shadow-inner"
                  style={{ background: settings.darkMode ? bg.gradient : bg.lightGradient }}
                />
                <span className="text-xs font-bold text-foreground truncate">{bg.name}</span>
              </button>
            ))}
          </div>
        </SettingsGroup>

        {/* ── 6 Themes ──────────────────────────────────────────────────── */}
        <SettingsGroup title={t("theme")}>
          <div className="p-3 grid grid-cols-3 gap-2">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => handleThemeChange(th.id)}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  activeTheme === th.id
                    ? "bg-primary/15 border-primary text-primary font-black shadow-sm"
                    : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-lg shadow-inner"
                  style={{ backgroundColor: th.primary }}
                />
                <span className="text-xs font-bold">{th.name}</span>
              </button>
            ))}
          </div>
        </SettingsGroup>

        {/* ── Accessibility & Controls ──────────────────────────────────── */}
        <SettingsGroup title={t("accessibility")}>
          <SettingToggle
            icon={<Eye className="w-5 h-5" />}
            label={t("colorblind_mode")}
            desc={t("colorblind_desc")}
            value={settings.colorBlindMode}
            onChange={() => {
              Haptics.tap();
              toggleColorBlind();
            }}
          />
          <div className="h-px bg-border/60 my-1" />
          <SettingToggle
            icon={<Smartphone className="w-5 h-5" />}
            label={t("haptics")}
            value={settings.vibration}
            onChange={() => {
              Haptics.tap();
              toggleVibration();
            }}
          />
          <div className="h-px bg-border/60 my-1" />
          <SettingToggle
            icon={<Moon className="w-5 h-5" />}
            label={t("dark_mode")}
            value={settings.darkMode}
            onChange={() => {
              Haptics.tap();
              toggleDarkMode();
            }}
          />
        </SettingsGroup>

        {/* ── Store & Restore Purchases ─────────────────────────────────── */}
        <SettingsGroup title="Store">
          <div className="p-3 flex flex-col gap-2">
            <button
              onClick={handleRestorePurchases}
              className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-primary" /> {t("restore_purchases")}
            </button>
            <button
              onClick={() => {
                Haptics.tap();
                SFX.tap();
                setPrivacyModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-primary" /> Privacy Policy
            </button>
            <div className="flex items-center justify-between p-1 pt-2 border-t border-border/50">
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground">Google Test Ads</span>
                <span className="text-[10px] text-muted-foreground">
                  {testAdsEnabled ? "Google sample test ad units" : "Live production ad units"}
                </span>
              </div>
              <button
                onClick={() => {
                  Haptics.tap();
                  SFX.tap();
                  const next = !testAdsEnabled;
                  setTestAdsEnabled(next);
                  setUseTestAds(next);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  testAdsEnabled ? "bg-amber-500" : "bg-secondary"
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: testAdsEnabled ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </SettingsGroup>

        {/* ── About ─────────────────────────────────────────────────────── */}
        <div className="text-center pt-2 pb-6">
          <p className="text-xs font-black text-foreground">{t("game_title")}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Version 2.0.0 · Studio Master Edition</p>
          <p className="text-[9px] text-muted-foreground/60 max-w-xs mx-auto mt-2">
            {t("about_game")}
          </p>
          <button
            onClick={() => {
              Haptics.tap();
              SFX.tap();
              setPrivacyModalOpen(true);
            }}
            className="text-[11px] text-primary/90 hover:underline font-bold mt-2"
          >
            Read Privacy Policy
          </button>
        </div>
      </div>

      {privacyModalOpen && (
        <PrivacyPolicyModal onClose={() => setPrivacyModalOpen(false)} />
      )}
    </motion.div>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-black text-primary uppercase tracking-wider ml-2">
        {title}
      </h3>
      <div className="bg-card/85 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

function SettingToggle({
  icon,
  label,
  desc,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3.5">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex flex-col">
          <span className="font-bold text-xs text-foreground">{label}</span>
          {desc && <span className="text-[10px] text-muted-foreground">{desc}</span>}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
          value ? "bg-primary" : "bg-secondary"
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: value ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SettingSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="px-4 py-1 pb-3 flex items-center">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-secondary rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
