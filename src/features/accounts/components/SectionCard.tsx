import type { ReactNode } from "react"
import { StyleSheet, View } from "react-native"

export function SectionCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6e9ef",
    padding: 18,
    gap: 10,
  },
})
