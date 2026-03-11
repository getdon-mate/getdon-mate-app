import { StyleSheet, Text, View } from "react-native"
import { uiColors } from "../tokens"

export function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: uiColors.text,
  },
  subtitle: {
    fontSize: 12,
    color: uiColors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.35,
  },
})
