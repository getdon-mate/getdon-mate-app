export const uiColors = {
  background: "#f8fafc",
  backgroundRaised: "#f1f5f9",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  surfaceStrong: "#eff6ff",
  border: "#e5e7eb",
  borderStrong: "#d1d5db",
  text: "#111827",
  textStrong: "#0f172a",
  textMuted: "#6b7280",
  textSoft: "#94a3b8",
  primary: "#2563eb",
  primaryPressed: "#1d4ed8",
  primarySoft: "#eff6ff",
  primaryBorder: "#bfdbfe",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  dangerBorder: "#fecaca",
  success: "#16a34a",
  successSoft: "#f0fdf4",
  successBorder: "#bbf7d0",
  overlay: "rgba(15, 23, 42, 0.06)",
  overlayStrong: "rgba(15, 23, 42, 0.45)",
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
    fontSize: 16,
    fontWeight: "700" as const,
    color: uiColors.text,
  },
  body: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: uiColors.textMuted,
  },
  caption: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: uiColors.textSoft,
  },
} as const
