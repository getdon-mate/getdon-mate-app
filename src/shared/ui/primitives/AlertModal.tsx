import { Modal, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius } from "../tokens"
import { Button } from "./Button"

export function AlertModal({
  visible,
  title,
  message,
  confirmLabel = "확인",
  tone = "neutral",
  onClose,
}: {
  visible: boolean
  title: string
  message?: string
  confirmLabel?: string
  tone?: "neutral" | "danger"
  onClose: () => void
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={[styles.title, tone === "danger" && styles.titleDanger]}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button
            label={confirmLabel}
            variant={tone === "danger" ? "danger" : "primary"}
            onPress={onClose}
            style={styles.action}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: uiColors.overlayStrong,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    width: "100%",
    backgroundColor: uiColors.surface,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: uiColors.text,
  },
  titleDanger: {
    color: uiColors.danger,
  },
  message: {
    fontSize: 14,
    color: uiColors.textMuted,
    lineHeight: 20,
  },
  action: {
    marginTop: 4,
  },
})
