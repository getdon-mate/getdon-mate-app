import { StyleSheet, Text, View } from "react-native"
import { uiColors, uiSpacing } from "../tokens"

export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.wordmark}>getdon mate</Text>
      <Text style={styles.caption}>지금 준비 중</Text>
      <Text style={styles.description}>회비와 일정 흐름을 정리하고 있습니다.</Text>
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
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.4,
  },
  caption: {
    marginTop: uiSpacing.sm,
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  description: {
    marginTop: uiSpacing.sm,
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  loadingRow: {
    marginTop: uiSpacing.xl,
    flexDirection: "row",
    gap: uiSpacing.xs,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: uiColors.textSoft,
  },
})
