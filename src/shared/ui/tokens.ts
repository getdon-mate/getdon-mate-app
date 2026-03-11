export const uiColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#e5e7eb",
  borderStrong: "#d1d5db",
  text: "#111827",
  textMuted: "#6b7280",
  primary: "#2563eb",
  primaryPressed: "#1d4ed8",
  primarySoft: "#eff6ff",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  success: "#16a34a",
} as const

export const uiRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 999,
} as const

export const uiSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
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
} as const
