import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function ActionChip({
  label,
  active,
  style,
  textStyle,
  ...props
}: PressableProps & {
  label: string
  active?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}) {
  return (
    <Pressable
      {...props}
      style={[styles.base, active && styles.active, style]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.text, active && styles.textActive, textStyle]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: uiRadius.full,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: uiColors.primarySoft,
    borderColor: uiColors.primaryBorder,
  },
  text: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  textActive: {
    color: uiColors.primary,
  },
})
