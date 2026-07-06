// Design tokens — single source of truth for the TV app's visual language.
// Values mirror the GoodWatch design system (dark surfaces, indigo accent).
// When exporting real values from the Figma library, update this file only —
// every screen and component reads from here.
export const colors = {
  background: "#0A0A0F",
  surface: "#16161D",
  surfaceRaised: "#1E1E28",

  brand: "#6366F1",
  brandStrong: "#818CF8",

  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.70)",
  textTertiary: "rgba(255,255,255,0.45)",

  match: "#4ADE80",
  rating: "#FBBF24",
  like: "#F43F5E",

  focusRing: "#FFFFFF",
  overlayStrong: "rgba(0,0,0,0.85)",
  overlaySoft: "rgba(0,0,0,0.40)",
  chipBg: "rgba(255,255,255,0.10)",
  chipBorder: "rgba(255,255,255,0.25)",
} as const;

// 10-foot UI spacing — roughly 1.5x what you'd use on mobile.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 60,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 100,
} as const;

// Type scale for 2-3m viewing distance (1080p canvas).
export const type = {
  hero: 64,
  title: 48,
  heading: 32,
  body: 20,
  caption: 16,
  small: 14,
} as const;
