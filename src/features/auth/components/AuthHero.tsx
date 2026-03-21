import { StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"

const FEATURES = [
  "회비 납부 현황을 한눈에 확인",
  "입출금 내역 공동 관리",
  "모임원과 게시판으로 소통",
] as const

export function AuthHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>gm</Text>
      </View>
      <Text style={styles.heroTitle}>getdon mate</Text>
      <Text style={styles.heroSubtitle}>모임 운영 흐름을 빠르게 확인하고 바로 정리하세요.</Text>
      {/* 기능 목록 추가 */}
      <View style={styles.featureList}>
        {FEATURES.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureDot}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
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
  featureList: {
    marginTop: 14,
    alignSelf: "stretch",
    gap: 6,
  },
  featureRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  featureDot: {
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  featureText: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
})
