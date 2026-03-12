import { useEffect } from "react"
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native"
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
  containerStyle,
}: {
  visible: boolean
  title: string
  message?: string
  tone?: ToastTone
  autoHideMs?: number
  onClose?: () => void
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
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
    <View
      style={[
        styles.wrap,
        tone === "success" && styles.success,
        tone === "warning" && styles.warning,
        tone === "danger" && styles.danger,
        style,
        containerStyle,
      ]}
    >
      <View style={styles.iconWrap}>
        <Icon name={toneIcon[tone]} size={14} color={uiColors.surface} />
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
    backgroundColor: uiColors.textStrong,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.textMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  success: {
    backgroundColor: uiColors.success,
    borderColor: uiColors.successBorder,
  },
  warning: {
    backgroundColor: "#b45309",
    borderColor: "#f59e0b",
  },
  danger: {
    backgroundColor: uiColors.danger,
    borderColor: uiColors.dangerBorder,
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
    color: uiColors.surface,
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    color: uiColors.surface,
    fontSize: 12,
    fontWeight: "500",
  },
})
