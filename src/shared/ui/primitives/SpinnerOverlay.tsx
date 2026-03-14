import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius, uiSpacing } from "../tokens"

export function SpinnerOverlay({ visible, label = "업데이트 중" }: { visible: boolean; label?: string }) {
  if (!visible) return null

  return (
    <View pointerEvents="auto" style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator color={uiColors.textStrong} size="small" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 24, 40, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  card: {
    minWidth: 132,
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: uiSpacing.md,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    alignItems: "center",
    gap: uiSpacing.sm,
  },
  label: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
})
