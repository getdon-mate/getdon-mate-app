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
    backgroundColor: uiColors.primarySoft,
    borderColor: uiColors.primaryBorder,
    iconBackgroundColor: uiColors.surface,
    iconColor: uiColors.primary,
    titleColor: uiColors.primaryPressed,
    messageColor: uiColors.textMuted,
  },
  success: {
    backgroundColor: uiColors.successSoft,
    borderColor: uiColors.successBorder,
    iconBackgroundColor: uiColors.surface,
    iconColor: uiColors.success,
    titleColor: uiColors.success,
    messageColor: uiColors.textMuted,
  },
  warning: {
    backgroundColor: uiColors.warningSoft,
    borderColor: uiColors.warningBorder,
    iconBackgroundColor: uiColors.surface,
    iconColor: uiColors.warning,
    titleColor: uiColors.warning,
    messageColor: uiColors.textMuted,
  },
  danger: {
    backgroundColor: uiColors.dangerSoft,
    borderColor: uiColors.dangerBorder,
    iconBackgroundColor: uiColors.surface,
    iconColor: uiColors.danger,
    titleColor: uiColors.danger,
    messageColor: uiColors.textMuted,
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
    shadowColor: uiColors.textStrong,
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
