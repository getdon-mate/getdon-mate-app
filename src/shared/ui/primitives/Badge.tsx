import { StyleSheet, Text, View, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function Badge({
  label,
  tone = "neutral",
  style,
}: {
  label: string
  tone?: "neutral" | "primary" | "danger"
  style?: ViewStyle | ViewStyle[]
}) {
  return (
    <View
      style={[
        styles.base,
        tone === "neutral" && styles.neutral,
        tone === "primary" && styles.primary,
        tone === "danger" && styles.danger,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          tone === "neutral" && styles.neutralText,
          tone === "primary" && styles.primaryText,
          tone === "danger" && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: uiRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: uiColors.surfaceMuted,
    borderColor: uiColors.border,
  },
  primary: {
    backgroundColor: uiColors.primarySoft,
    borderColor: "#dbeafe",
  },
  danger: {
    backgroundColor: uiColors.dangerSoft,
    borderColor: "#fecaca",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  neutralText: {
    color: uiColors.text,
  },
  primaryText: {
    color: uiColors.primary,
  },
  dangerText: {
    color: uiColors.danger,
  },
})
