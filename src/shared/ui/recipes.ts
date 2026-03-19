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
})
