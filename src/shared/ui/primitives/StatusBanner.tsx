import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius } from "../tokens"

export function StatusBanner({
  title,
  message,
  tone = "info",
  showMessage = false,
}: {
  title: string
  message: string
  tone?: "info" | "warning"
  showMessage?: boolean
}) {
  const pulse = useRef(new Animated.Value(0.75)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.75,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [pulse])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glow,
          tone === "warning" && styles.glowWarning,
          {
            opacity: pulse,
            transform: [{ scale: pulse.interpolate({ inputRange: [0.75, 1], outputRange: [0.92, 1.08] }) }],
          },
        ]}
      />
      <View style={[styles.wrap, tone === "warning" && styles.wrapWarning]}>
        <View style={styles.liveRow}>
          <Animated.View
            style={[
              styles.liveDot,
              tone === "warning" && styles.liveDotWarning,
              { opacity: pulse },
            ]}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {showMessage ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  glow: {
    position: "absolute",
    top: 3,
    width: 132,
    height: 32,
    borderRadius: uiRadius.full,
    backgroundColor: "rgba(34,197,94,0.2)",
  },
  glowWarning: {
    backgroundColor: "rgba(234,179,8,0.24)",
  },
  wrap: {
    alignSelf: "center",
    borderRadius: uiRadius.full,
    borderWidth: 1,
    borderColor: "#86efac",
    backgroundColor: "rgba(3, 105, 48, 0.92)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 116,
  },
  wrapWarning: {
    borderColor: "#fde68a",
    backgroundColor: "rgba(161, 98, 7, 0.94)",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  liveDotWarning: {
    backgroundColor: "#fde047",
    shadowColor: "#fde047",
  },
  title: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  message: {
    textAlign: "center",
    color: uiColors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 220,
  },
})
