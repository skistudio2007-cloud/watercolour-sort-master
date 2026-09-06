// ─── Theme & Background Management Engine ────────────────────────────────────

export type BackgroundId =
  | "deep_ocean"        // Deep Ocean (Default)
  | "midnight_blue"      // Midnight Blue
  | "dark_purple"        // Dark Purple
  | "moonlight"          // Moonlight
  | "aurora_night"       // Aurora Night
  | "mystic_forest"      // Mystic Forest
  | "deep_space"         // Deep Space
  | "dark_sunset"        // Dark Sunset
  | "blue_mist"          // Blue Mist
  | "premium_black_blue";// Premium Black Blue

export interface BackgroundConfig {
  id: BackgroundId;
  name: string;
  gradient: string;
  lightGradient: string;
  accent: string;
  isDark: boolean;
  bubbleColor: string;
  lightBubbleColor: string;
  desc: string;
}

export const BACKGROUNDS: BackgroundConfig[] = [
  {
    id: "deep_ocean",
    name: "Deep Ocean",
    gradient: "linear-gradient(165deg, #071326 0%, #0c2040 50%, #040d1a 100%)",
    lightGradient: "linear-gradient(165deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)",
    accent: "#38BDF8",
    isDark: true,
    bubbleColor: "rgba(56, 189, 248, 0.2)",
    lightBubbleColor: "rgba(56, 189, 248, 0.4)",
    desc: "Signature oceanic abyss with calm aquatic gleam",
  },
  {
    id: "midnight_blue",
    name: "Midnight Blue",
    gradient: "linear-gradient(165deg, #080e1e 0%, #111e3b 50%, #050813 100%)",
    lightGradient: "linear-gradient(165deg, #dbeafe 0%, #bfdbfe 50%, #eff6ff 100%)",
    accent: "#60A5FA",
    isDark: true,
    bubbleColor: "rgba(96, 165, 250, 0.18)",
    lightBubbleColor: "rgba(96, 165, 250, 0.35)",
    desc: "Silent sapphire sky with smooth reflective depth",
  },
  {
    id: "dark_purple",
    name: "Dark Purple",
    gradient: "linear-gradient(165deg, #140826 0%, #251042 50%, #0b0317 100%)",
    lightGradient: "linear-gradient(165deg, #f3e8ff 0%, #e9d5ff 50%, #faf5ff 100%)",
    accent: "#C084FC",
    isDark: true,
    bubbleColor: "rgba(192, 132, 252, 0.18)",
    lightBubbleColor: "rgba(192, 132, 252, 0.35)",
    desc: "Royal amethyst and soft twilight lavender",
  },
  {
    id: "moonlight",
    name: "Moonlight",
    gradient: "linear-gradient(165deg, #09121d 0%, #152336 50%, #080f19 100%)",
    lightGradient: "linear-gradient(165deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)",
    accent: "#93C5FD",
    isDark: true,
    bubbleColor: "rgba(224, 242, 254, 0.18)",
    lightBubbleColor: "rgba(148, 163, 184, 0.35)",
    desc: "Ethereal lunar glow reflected on calm waters",
  },
  {
    id: "aurora_night",
    name: "Aurora Night",
    gradient: "linear-gradient(165deg, #041824 0%, #0d2f3a 45%, #051329 100%)",
    lightGradient: "linear-gradient(165deg, #ccfbf1 0%, #99f6e4 50%, #f0fdfa 100%)",
    accent: "#2DD4BF",
    isDark: true,
    bubbleColor: "rgba(45, 212, 191, 0.18)",
    lightBubbleColor: "rgba(45, 212, 191, 0.35)",
    desc: "Shimmering arctic ribbons across polar horizons",
  },
  {
    id: "mystic_forest",
    name: "Mystic Forest",
    gradient: "linear-gradient(165deg, #051912 0%, #0c2d22 50%, #04100c 100%)",
    lightGradient: "linear-gradient(165deg, #d1fae5 0%, #a7f3d0 50%, #ecfdf5 100%)",
    accent: "#34D399",
    isDark: true,
    bubbleColor: "rgba(52, 211, 153, 0.16)",
    lightBubbleColor: "rgba(52, 211, 153, 0.35)",
    desc: "Serene morning canopy with whispering emerald calm",
  },
  {
    id: "deep_space",
    name: "Deep Space",
    gradient: "linear-gradient(165deg, #04050d 0%, #0e1124 50%, #020207 100%)",
    lightGradient: "linear-gradient(165deg, #e0e7ff 0%, #c7d2fe 50%, #eef2ff 100%)",
    accent: "#818CF8",
    isDark: true,
    bubbleColor: "rgba(129, 140, 248, 0.18)",
    lightBubbleColor: "rgba(129, 140, 248, 0.35)",
    desc: "Infinite cosmos with radiant periwinkle aura",
  },
  {
    id: "dark_sunset",
    name: "Dark Sunset",
    gradient: "linear-gradient(165deg, #1f0b14 0%, #361726 50%, #120409 100%)",
    lightGradient: "linear-gradient(165deg, #ffe4e6 0%, #fecdd3 50%, #fff1f2 100%)",
    accent: "#FB7185",
    isDark: true,
    bubbleColor: "rgba(251, 113, 133, 0.18)",
    lightBubbleColor: "rgba(251, 113, 133, 0.35)",
    desc: "Golden rose dusk embers and soft daylight glow",
  },
  {
    id: "blue_mist",
    name: "Blue Mist",
    gradient: "linear-gradient(165deg, #0a1622 0%, #152c42 50%, #071018 100%)",
    lightGradient: "linear-gradient(165deg, #e2e8f0 0%, #cbd5e1 50%, #f8fafc 100%)",
    accent: "#38BDF8",
    isDark: true,
    bubbleColor: "rgba(56, 189, 248, 0.15)",
    lightBubbleColor: "rgba(56, 189, 248, 0.35)",
    desc: "Subtle atmospheric mountain fog rolling over bay",
  },
  {
    id: "premium_black_blue",
    name: "Premium Black Blue",
    gradient: "linear-gradient(165deg, #02060d 0%, #07111e 50%, #010307 100%)",
    lightGradient: "linear-gradient(165deg, #e0f2fe 0%, #cbd5e1 50%, #f1f5f9 100%)",
    accent: "#0284C7",
    isDark: true,
    bubbleColor: "rgba(255, 255, 255, 0.12)",
    lightBubbleColor: "rgba(2, 132, 199, 0.35)",
    desc: "Diamond ice glass and luxury sapphire styling",
  },
];

export type ThemeStyle = "classic" | "ocean" | "midnight" | "neon" | "candy" | "luxury";

export interface ThemeConfig {
  id: ThemeStyle;
  name: string;
  primary: string;
  cardBg: string;
  glassBorder: string;
  glassShine: string;
  tubeBorder: string;
  desc: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "classic",
    name: "Classic Luxury",
    primary: "#38BDF8",
    cardBg: "rgba(12, 22, 38, 0.85)",
    glassBorder: "rgba(255, 255, 255, 0.25)",
    glassShine: "rgba(255, 255, 255, 0.22)",
    tubeBorder: "rgba(255, 255, 255, 0.35)",
    desc: "Deep studio navy with crystal lab glass aesthetics",
  },
  {
    id: "ocean",
    name: "Oceanic Abyssal",
    primary: "#0EA5E9",
    cardBg: "rgba(7, 19, 38, 0.85)",
    glassBorder: "rgba(56, 189, 248, 0.35)",
    glassShine: "rgba(56, 189, 248, 0.28)",
    tubeBorder: "rgba(186, 230, 253, 0.45)",
    desc: "Pure deep-water trench with aquamarine refraction",
  },
  {
    id: "midnight",
    name: "Midnight Indigo",
    primary: "#818CF8",
    cardBg: "rgba(11, 16, 33, 0.88)",
    glassBorder: "rgba(255, 255, 255, 0.22)",
    glassShine: "rgba(255, 255, 255, 0.18)",
    tubeBorder: "rgba(255, 255, 255, 0.32)",
    desc: "Deep sapphire night with low eye-strain contours",
  },
  {
    id: "neon",
    name: "Neon Night",
    primary: "#06B6D4",
    cardBg: "rgba(15, 10, 30, 0.88)",
    glassBorder: "rgba(34, 211, 238, 0.45)",
    glassShine: "rgba(217, 70, 239, 0.3)",
    tubeBorder: "rgba(34, 211, 238, 0.55)",
    desc: "Dark cyberpunk silhouette with vivid glow accents",
  },
  {
    id: "candy",
    name: "Candy Night",
    primary: "#F472B6",
    cardBg: "rgba(30, 14, 26, 0.88)",
    glassBorder: "rgba(244, 114, 182, 0.35)",
    glassShine: "rgba(251, 207, 232, 0.25)",
    tubeBorder: "rgba(244, 114, 182, 0.45)",
    desc: "Rich dark plum base with jewel candy highlights",
  },
  {
    id: "luxury",
    name: "Obsidian Gold",
    primary: "#EAB308",
    cardBg: "rgba(20, 17, 12, 0.9)",
    glassBorder: "rgba(234, 179, 8, 0.4)",
    glassShine: "rgba(253, 224, 71, 0.28)",
    tubeBorder: "rgba(250, 204, 21, 0.5)",
    desc: "Opulent golden foil accents with velvet charcoal base",
  },
];

const KEY_BG = "ws2_active_bg";
const KEY_THEME = "ws2_active_theme";
const KEY_UNLOCKED_BGS = "ws2_unlocked_bgs";
const KEY_UNLOCKED_THEMES = "ws2_unlocked_theme_styles";

export const DEFAULT_FREE_BGS: BackgroundId[] = ["deep_ocean", "midnight_blue"];
export const DEFAULT_FREE_THEMES: ThemeStyle[] = ["classic", "ocean"];

export function loadUnlockedBackgrounds(): BackgroundId[] {
  try {
    const raw = localStorage.getItem(KEY_UNLOCKED_BGS);
    if (!raw) return [...DEFAULT_FREE_BGS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return Array.from(new Set([...DEFAULT_FREE_BGS, ...parsed]));
    }
  } catch {
    // Fallback
  }
  return [...DEFAULT_FREE_BGS];
}

export function isBackgroundUnlocked(id: BackgroundId): boolean {
  return loadUnlockedBackgrounds().includes(id);
}

export function unlockBackground(id: BackgroundId): boolean {
  try {
    const list = loadUnlockedBackgrounds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEY_UNLOCKED_BGS, JSON.stringify(list));
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

export function loadUnlockedThemeStyles(): ThemeStyle[] {
  try {
    const raw = localStorage.getItem(KEY_UNLOCKED_THEMES);
    if (!raw) return [...DEFAULT_FREE_THEMES];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return Array.from(new Set([...DEFAULT_FREE_THEMES, ...parsed]));
    }
  } catch {
    // Fallback
  }
  return [...DEFAULT_FREE_THEMES];
}

export function isThemeStyleUnlocked(id: ThemeStyle): boolean {
  return loadUnlockedThemeStyles().includes(id);
}

export function unlockThemeStyle(id: ThemeStyle): boolean {
  try {
    const list = loadUnlockedThemeStyles();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEY_UNLOCKED_THEMES, JSON.stringify(list));
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

export function getSavedBackground(): BackgroundId {
  try {
    const val = localStorage.getItem(KEY_BG) as BackgroundId;
    if (val && BACKGROUNDS.some((b) => b.id === val)) return val;
  } catch {
    // Ignore
  }
  return "deep_ocean";
}

export function saveBackground(bg: BackgroundId): void {
  try {
    localStorage.setItem(KEY_BG, bg);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ws2_bg_change", { detail: bg }));
    }
  } catch {
    // Ignore
  }
}

export function getSavedTheme(): ThemeStyle {
  try {
    const val = localStorage.getItem(KEY_THEME) as ThemeStyle;
    if (val && THEMES.some((t) => t.id === val)) return val;
  } catch {
    // Ignore
  }
  return "classic";
}

export function saveTheme(theme: ThemeStyle): void {
  try {
    localStorage.setItem(KEY_THEME, theme);
  } catch {
    // Ignore
  }
}

export function getBackgroundConfig(id: BackgroundId): BackgroundConfig {
  return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
}

export function getThemeConfig(id: ThemeStyle): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
