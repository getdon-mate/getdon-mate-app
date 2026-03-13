import { StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function StatusBanner({
  title,
  message,
  tone = "info",
  showMessage = false,
}: {
  title: string
  message: string
  tone?: "info" | "warning"
  showMessage?: boolean
}) {
  return (
    <View style={[styles.wrap, tone === "warning" && styles.wrapWarning]}>
      <Text style={styles.title}>{title}</Text>
      {showMessage ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  wrapWarning: {
    borderColor: uiColors.warningBorder,
    backgroundColor: uiColors.warningSoft,
  },
  title: {
    color: uiColors.textStrong,
    fontSize: 12,
    fontWeight: "700",
  },
  message: {
    color: uiColors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 240,
  },
})
