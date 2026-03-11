import { StyleSheet, Text, View } from "react-native"

export function AuthHero() {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>모임통장</Text>
      <Text style={styles.heroSubtitle}>우리 모임의 스마트한 회비 관리</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#dbeafe",
    fontSize: 14,
  },
})
