import { StyleSheet, Text, View } from "react-native"

export function AuthHero() {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroEyebrow}>Getdon Mate</Text>
      <Text style={styles.heroTitle}>모임통장</Text>
      <Text style={styles.heroSubtitle}>회비, 거래, 멤버 관리를 한 화면에서 정리하세요.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  heroEyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  heroSubtitle: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
  },
})
