import { StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"

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
    color: uiColors.text,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: uiColors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  iconText: {
    color: uiColors.primary,
    fontWeight: "700",
    fontSize: 30,
  },
})
