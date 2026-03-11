import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost"
type ButtonSize = "md" | "lg"

export function Button({
  label,
  variant = "primary",
  size = "md",
  style,
  disabled,
  ...props
}: PressableProps & {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  style?: ViewStyle | ViewStyle[]
}) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        variant === "ghost" && styles.ghost,
        size === "lg" && styles.lg,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.baseText,
          variant === "primary" && styles.primaryText,
          variant === "secondary" && styles.secondaryText,
          variant === "danger" && styles.dangerText,
          variant === "ghost" && styles.ghostText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: uiRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  lg: {
    paddingVertical: 15,
  },
  disabled: {
    opacity: 0.6,
  },
  primary: {
    backgroundColor: uiColors.primary,
    borderColor: uiColors.primary,
  },
  secondary: {
    backgroundColor: uiColors.primarySoft,
    borderColor: "#dbeafe",
  },
  danger: {
    backgroundColor: uiColors.dangerSoft,
    borderColor: "#fecaca",
  },
  ghost: {
    backgroundColor: uiColors.surface,
    borderColor: uiColors.border,
  },
  baseText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: uiColors.primary,
  },
  dangerText: {
    color: uiColors.danger,
  },
  ghostText: {
    color: "#334155",
  },
})
