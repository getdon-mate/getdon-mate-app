import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function RadioButton({
  checked,
  disabled,
  style,
  ...props
}: PressableProps & {
  checked: boolean
  disabled?: boolean
  style?: ViewStyle | ViewStyle[]
}) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      style={[styles.base, checked && styles.baseChecked, disabled && styles.baseDisabled, style]}
    >
      {checked ? <View style={styles.dot} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    width: 22,
    height: 22,
    borderRadius: uiRadius.full,
    borderWidth: 2,
    borderColor: uiColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.surface,
  },
  baseChecked: {
    borderColor: uiColors.primary,
  },
  baseDisabled: {
    opacity: 0.45,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: uiRadius.full,
    backgroundColor: uiColors.primary,
  },
})
