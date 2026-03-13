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
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: uiColors.textStrong,
  },
  subtitle: {
    fontSize: 13,
    color: uiColors.textMuted,
    fontWeight: "500",
    lineHeight: 19,
  },
})
