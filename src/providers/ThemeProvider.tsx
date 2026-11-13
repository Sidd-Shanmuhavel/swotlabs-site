"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type ThemeColor = "lime" | "cyan" | "orange" | "blue";

/**
 * An anchor is a hue plus the accent's lightness and chroma at that hue.
 * Everything else in the palette is derived from it, so switching accent
 * re-tints the whole canvas instead of dropping a foreign hue on grey.
 */
type Anchor = { hue: number; accentL: number; accentC: number };

const anchors: Record<ThemeColor, Anchor> = {
  lime: { hue: 130, accentL: 82, accentC: 0.17 },
  cyan: { hue: 205, accentL: 84, accentC: 0.12 },
  orange: { hue: 55, accentL: 76, accentC: 0.16 },
  // Blue sits lower on the lightness curve: at 82% it turns pastel and the
  // accent-ink label loses contrast against it.
  blue: { hue: 260, accentL: 68, accentC: 0.18 },
};

/**
 * The ramp. Lightness steps are fixed across anchors; only the hue moves, per
 * design.md. Neutrals keep 0.008–0.014 chroma so nothing is flat grey.
 */
function buildRamp({ hue, accentL, accentC }: Anchor) {
  const o = (l: number, c: number) => `oklch(${l}% ${c} ${hue})`;

  return {
    hue,
    paper: o(14, 0.012),
    paper2: o(18, 0.014),
    paper3: o(22, 0.014),
    rule: o(30, 0.012),
    neutral: o(58, 0.01),
    muted: o(74, 0.008),
    ink: o(95, 0.008),
    accent: o(accentL, accentC),
    accentLight: o(Math.min(accentL + 7, 96), Math.max(accentC - 0.03, 0.05)),
    accentInk: o(16, 0.02),
    focus: o(accentL, accentC),
    // The one inverted surface — third-party logos ship for light backgrounds.
    panel: o(95, 0.006),
    panelRule: o(86, 0.006),
  };
}

export const themeOptions: Record<ThemeColor, ThemeColors> = {
  lime: buildRamp(anchors.lime),
  cyan: buildRamp(anchors.cyan),
  orange: buildRamp(anchors.orange),
  blue: buildRamp(anchors.blue),
};

export type ThemeColors = ReturnType<typeof buildRamp>;

export const THEME_STORAGE_KEY = "swotlabs-theme";

/** Ramp key → CSS custom property. The aliases in globals.css follow these. */
const cssVarByKey: Record<keyof Omit<ThemeColors, "hue">, string> = {
  paper: "--color-paper",
  paper2: "--color-paper-2",
  paper3: "--color-paper-3",
  rule: "--color-rule",
  neutral: "--color-neutral",
  muted: "--color-muted",
  ink: "--color-ink",
  accent: "--color-accent",
  accentLight: "--color-accent-light",
  accentInk: "--color-accent-ink",
  focus: "--color-focus",
  panel: "--color-panel",
  panelRule: "--color-panel-rule",
};

function toCssVars(colors: ThemeColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(cssVarByKey)) {
    out[cssVar] = colors[key as keyof typeof cssVarByKey];
  }
  return out;
}

export const THEME_CSS_VARS: Record<ThemeColor, Record<string, string>> = {
  lime: toCssVars(themeOptions.lime),
  cyan: toCssVars(themeOptions.cyan),
  orange: toCssVars(themeOptions.orange),
  blue: toCssVars(themeOptions.blue),
};

type ThemeContextType = {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  currentColors: ThemeColors;
};

/**
 * Inline script run in <head> before paint. Applies the saved anchor's whole
 * ramp so there's no first-frame colour flash. Kept as a plain string (no
 * closures) because it's injected via dangerouslySetInnerHTML.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=${JSON.stringify(
  THEME_CSS_VARS
)};var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(!t||!m[t])t="lime";var v=m[t],r=document.documentElement.style;for(var k in v)r.setProperty(k,v[k]);}catch(e){}})();`;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start from the default so the first client render matches the SSR
  // markup (no hydration mismatch). The inline THEME_INIT_SCRIPT already set
  // the CSS variables from localStorage before paint, so there's no colour
  // flash; we sync React state to the saved value right after mount below.
  const [theme, setThemeState] = useState<ThemeColor>("lime");
  const hydrated = useRef(false);

  // Load the saved preference once, after hydration. We deliberately start
  // from the default ("lime") on first render to match SSR, then sync to the
  // stored value here — this one-time hydration sync is the intended use of an
  // effect, so the set-state-in-effect rule is a false positive here.
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor | null;
    if (saved && themeOptions[saved] && saved !== "lime") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(saved);
    }
    hydrated.current = true;
  }, []);

  // Apply the ramp + persist whenever the theme changes — but skip the initial
  // render, since the inline script already applied the saved colours.
  useEffect(() => {
    if (!hydrated.current) return;

    const root = document.documentElement;
    for (const [cssVar, value] of Object.entries(THEME_CSS_VARS[theme])) {
      root.style.setProperty(cssVar, value);
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = setThemeState;

  const currentColors = themeOptions[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
