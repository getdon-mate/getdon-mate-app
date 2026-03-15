import { StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"

export function AuthHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>gm</Text>
      </View>
      <Text style={styles.heroTitle}>getdon mate</Text>
      <Text style={styles.heroSubtitle}>모임 운영 흐름을 빠르게 확인하고 바로 정리하세요.</Text>
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
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    textTransform: "lowercase",
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
    fontSize: 22,
    textTransform: "lowercase",
  },
})
