import { StyleSheet, Text } from "react-native"
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
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  description: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
  },
})
