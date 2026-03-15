import { Pressable, StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"

export function SectionHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={`${title} ${actionLabel}`}>
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: uiColors.text,
  },
  action: {
    color: uiColors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
})
