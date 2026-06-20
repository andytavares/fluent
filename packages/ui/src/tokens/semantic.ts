import { color } from "./primitives";

// Semantic token layer — maps intent to primitive values.
// Dark theme is the default.

export const semanticDark = {
  // Surface
  "surface-base": color.slate950,
  "surface-raised": color.slate900,
  "surface-overlay": color.slate800,
  "surface-sunken": color.slate950,

  // Text
  "text-primary": color.slate50,
  "text-secondary": color.slate400,
  "text-disabled": color.slate600,
  "text-inverse": color.slate950,
  "text-link": color.indigo400,

  // Border
  "border-default": color.slate700,
  "border-subtle": color.slate800,
  "border-focus": color.indigo500,

  // Status
  "status-success-bg": color.green600,
  "status-success-text": color.green400,
  "status-warning-bg": color.amber500,
  "status-warning-text": color.amber400,
  "status-error-bg": color.red600,
  "status-error-text": color.red400,

  // Interactive
  "interactive-primary": color.indigo500,
  "interactive-primary-hover": color.indigo600,
  "interactive-primary-text": color.white,
  "interactive-secondary": color.slate700,
  "interactive-secondary-hover": color.slate600,
  "interactive-secondary-text": color.slate50,
} as const;

export type SemanticTokens = { [K in keyof typeof semanticDark]: string };

export const semanticLight: SemanticTokens = {
  "surface-base": color.white,
  "surface-raised": color.slate50,
  "surface-overlay": color.slate100,
  "surface-sunken": color.slate200,

  "text-primary": color.slate900,
  "text-secondary": color.slate500,
  "text-disabled": color.slate300,
  "text-inverse": color.white,
  "text-link": color.indigo600,

  "border-default": color.slate200,
  "border-subtle": color.slate100,
  "border-focus": color.indigo500,

  "status-success-bg": color.green500,
  "status-success-text": color.green600,
  "status-warning-bg": color.amber400,
  "status-warning-text": color.amber500,
  "status-error-bg": color.red500,
  "status-error-text": color.red600,

  "interactive-primary": color.indigo600,
  "interactive-primary-hover": color.indigo700,
  "interactive-primary-text": color.white,
  "interactive-secondary": color.slate200,
  "interactive-secondary-hover": color.slate300,
  "interactive-secondary-text": color.slate900,
};
