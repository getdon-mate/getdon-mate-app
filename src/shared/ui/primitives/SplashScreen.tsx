import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { uiColors, uiSpacing } from "../tokens"

export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.wordmark}>getdon mate</Text>
      <Text style={styles.caption}>모임통장 관리</Text>
      <ActivityIndicator color={uiColors.textStrong} size="small" style={styles.spinner} />
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
    textTransform: "lowercase",
  },
  caption: {
    marginTop: uiSpacing.sm,
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  spinner: {
    marginTop: uiSpacing.xl,
  },
})
