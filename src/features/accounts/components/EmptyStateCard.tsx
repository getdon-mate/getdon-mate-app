import { StyleSheet, Text } from "react-native"
import { uiColors, uiTypography } from "@shared/ui"
import { SectionCard } from "./SectionCard"

export function EmptyStateCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <SectionCard>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
})
