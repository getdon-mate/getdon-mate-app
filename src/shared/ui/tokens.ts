import { uiPalette } from "./palette"

export const uiColors = {
  background: uiPalette.canvas,
  backgroundRaised: uiPalette.canvasRaised,
  backgroundScreen: uiPalette.canvasScreen,
  surface: uiPalette.surface,
  surfaceMuted: uiPalette.surfaceMuted,
  surfaceStrong: uiPalette.surfaceStrong,
  border: uiPalette.line,
  borderStrong: uiPalette.lineStrong,
  text: uiPalette.ink,
  textStrong: uiPalette.inkStrong,
  textMuted: uiPalette.inkMuted,
  textSoft: uiPalette.inkSoft,
  primary: uiPalette.cobalt,
  primaryPressed: uiPalette.cobaltPressed,
  primarySoft: uiPalette.cobaltSoft,
  primaryBorder: uiPalette.cobaltLine,
  accent: uiPalette.lilac,
  accentSoft: uiPalette.lilacSoft,
  accentBorder: uiPalette.lilacLine,
  danger: uiPalette.danger,
  dangerSoft: uiPalette.dangerSoft,
  dangerBorder: uiPalette.dangerLine,
  success: uiPalette.success,
  successSoft: uiPalette.successSoft,
  successBorder: uiPalette.successLine,
  warning: uiPalette.warning,
  warningSoft: uiPalette.warningSoft,
  warningBorder: uiPalette.warningLine,
  overlay: uiPalette.shadow,
  overlayStrong: uiPalette.shadowStrong,
} as const

export const uiRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  full: 999,
} as const

export const uiSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const

export const uiTypography = {
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: uiColors.text,
  },
  section: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: uiColors.textStrong,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: uiColors.textMuted,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: uiColors.textSoft,
  },
  metric: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: uiColors.textStrong,
  },
} as const
