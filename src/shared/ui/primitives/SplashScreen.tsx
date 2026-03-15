import { StyleSheet, Text, View } from "react-native"
import { uiColors, uiSpacing } from "../tokens"

export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.wordmark}>getdon mate</Text>
      <Text style={styles.caption}>안전하게 준비 중</Text>
      <Text style={styles.description}>최근 데이터와 화면 상태를 정리하고 있어요.</Text>
      <View style={styles.loadingRow}>
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.background,
    paddingHorizontal: uiSpacing.xxl,
  },
  wordmark: {
    color: uiColors.textStrong,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  caption: {
    marginTop: uiSpacing.sm,
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
  },
  description: {
    marginTop: uiSpacing.sm,
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  loadingRow: {
    marginTop: uiSpacing.xl,
    flexDirection: "row",
    gap: uiSpacing.sm,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: uiColors.textSoft,
  },
})
