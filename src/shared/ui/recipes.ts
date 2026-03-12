import { StyleSheet } from "react-native"
import { uiColors, uiRadius, uiSpacing } from "./tokens"

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
    fontSize: 16,
    fontWeight: "700",
    color: uiColors.text,
  },
  metricLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    color: uiColors.textStrong,
    fontSize: 18,
    fontWeight: "800",
  },
  softCard: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
    backgroundColor: uiColors.surfaceMuted,
    padding: uiSpacing.md,
    gap: uiSpacing.xs,
  },
})
