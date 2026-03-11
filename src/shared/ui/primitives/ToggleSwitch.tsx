import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function ToggleSwitch({
  value,
  disabled,
  style,
  ...props
}: PressableProps & {
  value: boolean
  disabled?: boolean
  style?: ViewStyle | ViewStyle[]
}) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.track, value && styles.trackOn, disabled && styles.trackDisabled, style]}
    >
      <View style={[styles.thumb, value && styles.thumbOn]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 30,
    borderRadius: uiRadius.full,
    backgroundColor: "#d1d5db",
    paddingHorizontal: 3,
    justifyContent: "center",
  },
  trackOn: {
    backgroundColor: uiColors.primary,
  },
  trackDisabled: {
    opacity: 0.45,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: uiRadius.full,
    backgroundColor: uiColors.surface,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
    transform: [{ translateX: 0 }],
  },
  thumbOn: {
    transform: [{ translateX: 18 }],
  },
})
