// Primitive (raw) token values — do not reference these in components directly.
// Use semantic tokens instead.

export const color = {
  // Slate scale (grays)
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  slate950: "#020617",

  // Indigo scale (primary)
  indigo400: "#818cf8",
  indigo500: "#6366f1",
  indigo600: "#4f46e5",
  indigo700: "#4338ca",

  // Green scale (success)
  green400: "#4ade80",
  green500: "#22c55e",
  green600: "#16a34a",

  // Amber scale (warning)
  amber400: "#fbbf24",
  amber500: "#f59e0b",

  // Red scale (error)
  red400: "#f87171",
  red500: "#ef4444",
  red600: "#dc2626",

  // Base
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const;

export const fontSize = {
  xs: ["0.75rem", "1rem"],
  sm: ["0.875rem", "1.25rem"],
  base: ["1rem", "1.5rem"],
  lg: ["1.125rem", "1.75rem"],
  xl: ["1.25rem", "1.75rem"],
  "2xl": ["1.5rem", "2rem"],
  "3xl": ["1.875rem", "2.25rem"],
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;
