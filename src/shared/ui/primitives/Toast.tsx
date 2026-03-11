import { useEffect } from "react"
import { StyleSheet, Text, View, type ViewStyle } from "react-native"
import { uiColors, uiRadius } from "../tokens"
import { Icon } from "./Icon"

type ToastTone = "info" | "success" | "warning" | "danger"

const toneIcon: Record<ToastTone, "info" | "check" | "warning" | "close"> = {
  info: "info",
  success: "check",
  warning: "warning",
  danger: "close",
}

export function Toast({
  visible,
  title,
  message,
  tone = "info",
  autoHideMs = 2400,
  onClose,
  style,
}: {
  visible: boolean
  title: string
  message?: string
  tone?: ToastTone
  autoHideMs?: number
  onClose?: () => void
  style?: ViewStyle | ViewStyle[]
}) {
  useEffect(() => {
    if (!visible || !onClose || autoHideMs <= 0) return
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      onClose()
    }, autoHideMs)
    return () => clearTimeout(timer)
  }, [visible, autoHideMs, onClose])

  if (!visible) return null

  return (
    <View style={[styles.wrap, tone === "success" && styles.success, tone === "warning" && styles.warning, tone === "danger" && styles.danger, style]}>
      <View style={styles.iconWrap}>
        <Icon name={toneIcon[tone]} size={14} color="#ffffff" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    zIndex: 100,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  success: {
    backgroundColor: uiColors.success,
    borderColor: "#15803d",
  },
  warning: {
    backgroundColor: "#b45309",
    borderColor: "#92400e",
  },
  danger: {
    backgroundColor: uiColors.danger,
    borderColor: "#b91c1c",
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: uiRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "500",
  },
})
