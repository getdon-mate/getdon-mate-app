import { StyleSheet, View } from "react-native"
import { Card, SkeletonBlock, uiSpacing } from "@shared/ui"

export function LoadingStateCard({
  lines = 3,
}: {
  lines?: number
}) {
  return (
    <Card style={styles.card}>
      <SkeletonBlock width="36%" height={12} />
      <SkeletonBlock width="62%" height={24} />
      <View style={styles.lineStack}>
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock key={index} width={index === lines - 1 ? "58%" : "100%"} height={12} />
        ))}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: uiSpacing.md,
  },
  lineStack: {
    gap: uiSpacing.sm,
  },
})
