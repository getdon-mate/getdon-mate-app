import { StyleSheet } from "react-native"
import { uiColors, uiRadius, uiSpacing, uiTypography } from "./tokens"

export const uiRecipes = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: uiSpacing.xs,
  },
  sectionTitle: {
    ...uiTypography.section,
  },
  metricLabel: {
    ...uiTypography.caption,
    color: uiColors.textMuted,
  },
  metricValue: {
    ...uiTypography.metric,
  },
  softCard: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
    backgroundColor: uiColors.surfaceMuted,
    padding: uiSpacing.md,
    gap: uiSpacing.xs,
  },
  screenBackground: {
    flex: 1,
    backgroundColor: uiColors.backgroundScreen,
  },
  stackCompact: {
    gap: 10,
  },
  summaryPillRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    borderRadius: uiRadius.md,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.md,
    backgroundColor: uiColors.surfaceMuted,
    borderWidth: 1,
    borderColor: uiColors.border,
    gap: 4,
    alignItems: "center",
  },
  summaryPillLabel: {
    ...uiTypography.caption,
    fontWeight: "700",
  },
  summaryPillValue: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "800",
  },
  progressTrack: {
    height: 10,
    borderRadius: uiRadius.full,
    backgroundColor: uiColors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: uiColors.primary,
    borderRadius: uiRadius.full,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: uiColors.surface,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 8,
  },
  roundIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: uiColors.surfaceMuted,
    borderWidth: 1,
    borderColor: uiColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    borderRadius: uiRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
})
