import { StyleSheet, Text } from "react-native"
import { Button, uiColors, uiTypography } from "@shared/ui"
import { SectionCard } from "./SectionCard"

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <SectionCard>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} style={styles.actionButton} /> : null}
    </SectionCard>
  )
}

const styles = StyleSheet.create({
  title: {
    ...uiTypography.section,
    fontSize: 15,
  },
  description: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  actionButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    minWidth: 120,
  },
})
