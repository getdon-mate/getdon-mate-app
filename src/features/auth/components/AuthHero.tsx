import { StyleSheet, Text, View } from "react-native"

export function AuthHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>⇢</Text>
      </View>
      <Text style={styles.heroTitle}>모임의 시작</Text>
      <Text style={styles.heroSubtitle}>투명하고 편안한 모임통장을 경험해보세요.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: "center",
  },
  heroTitle: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  iconText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 30,
  },
})
