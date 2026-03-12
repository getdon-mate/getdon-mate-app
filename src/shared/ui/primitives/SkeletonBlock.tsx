import { StyleSheet, View, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function SkeletonBlock({
  width = "100%",
  height = 14,
  style,
}: {
  width?: number | `${number}%`
  height?: number
  style?: ViewStyle | ViewStyle[]
}) {
  return <View style={[styles.base, { width, height }, style]} />
}

const styles = StyleSheet.create({
  base: {
    borderRadius: uiRadius.full,
    backgroundColor: uiColors.backgroundRaised,
  },
})
