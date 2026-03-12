import { StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function StatusBanner({
  title,
  message,
  tone = "info",
}: {
  title: string
  message: string
  tone?: "info" | "warning"
}) {
  return (
    <View style={[styles.wrap, tone === "warning" && styles.wrapWarning]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  wrapWarning: {
    borderColor: "#fcd34d",
    backgroundColor: "#fffbeb",
  },
  title: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
})
