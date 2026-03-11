import type { ReactNode } from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function Card({
  children,
  style,
}: {
  children: ReactNode
  style?: ViewStyle | ViewStyle[]
}) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: uiColors.surface,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.xl,
    padding: 18,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
})
