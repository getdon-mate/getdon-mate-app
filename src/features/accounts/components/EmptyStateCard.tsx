import { StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { Button, uiColors, uiTypography } from "@shared/ui"
import { SectionCard } from "./SectionCard"

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}) {
  const { width } = useWindowDimensions()
  const compact = width < 390

  return (
    <SectionCard>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.description, compact && styles.descriptionCompact]}>{description}</Text>
      {actionLabel && onAction ? (
        <View style={[styles.actionsRow, compact && styles.actionsRowCompact]}>
          <Button label={actionLabel} variant="secondary" onPress={onAction} style={[styles.actionButton, compact && styles.actionButtonCompact]} />
          {secondaryActionLabel && onSecondaryAction ? (
            <Button
              label={secondaryActionLabel}
              variant="ghost"
              onPress={onSecondaryAction}
              style={[styles.actionButton, compact && styles.actionButtonCompact]}
            />
          ) : null}
        </View>
      ) : null}
    </SectionCard>
  )
}

const styles = StyleSheet.create({
  title: {
    ...uiTypography.section,
    fontSize: 15,
  },
  titleCompact: {
    fontSize: 14,
  },
  description: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  descriptionCompact: {
    fontSize: 12,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  actionsRowCompact: {
    gap: 6,
  },
  actionButton: {
    alignSelf: "flex-start",
    minWidth: 120,
  },
  actionButtonCompact: {
    minWidth: 104,
  },
})
