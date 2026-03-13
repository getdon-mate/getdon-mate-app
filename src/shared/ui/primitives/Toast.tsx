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

const toneStyles = {
  info: {
    backgroundColor: "#eaf3ff",
    borderColor: "#cfe0ff",
    iconBackgroundColor: "#d6e8ff",
    iconColor: "#2563eb",
    titleColor: "#1d4ed8",
    messageColor: "#24538b",
  },
  success: {
    backgroundColor: "#eaf8f0",
    borderColor: "#cfead9",
    iconBackgroundColor: "#d7f0e2",
    iconColor: "#15803d",
    titleColor: "#15803d",
    messageColor: "#2b6f4f",
  },
  warning: {
    backgroundColor: "#fff6ea",
    borderColor: "#f7dfbe",
    iconBackgroundColor: "#ffe9c9",
    iconColor: "#d97706",
    titleColor: "#c26b07",
    messageColor: "#9a5b0d",
  },
  danger: {
    backgroundColor: "#fff0f1",
    borderColor: "#f4d2d8",
    iconBackgroundColor: "#ffe0e5",
    iconColor: "#dc2626",
    titleColor: "#dc2626",
    messageColor: "#b4232f",
  },
} as const

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

  const palette = toneStyles[tone]

  return (
    <View
      testID="toast-wrap"
      style={[
        styles.wrap,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: palette.iconBackgroundColor,
          },
        ]}
      >
        <Icon name={toneIcon[tone]} size={14} color={palette.iconColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: palette.titleColor }]}>{title}</Text>
        {message ? (
          <Text testID="toast-message" style={[styles.message, { color: palette.messageColor }]}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignSelf: "center",
    width: "auto",
    maxWidth: 360,
    bottom: 20,
    zIndex: 100,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderRadius: uiRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: uiRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  textWrap: {
    flexShrink: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  message: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
})
