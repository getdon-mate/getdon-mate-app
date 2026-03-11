import { Modal, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius } from "../tokens"
import { Button } from "./Button"

export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel = "취소",
  confirmLabel = "확인",
  confirmTone = "primary",
  onCancel,
  onConfirm,
}: {
  visible: boolean
  title: string
  message?: string
  cancelLabel?: string
  confirmLabel?: string
  confirmTone?: "primary" | "danger"
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="ghost" onPress={onCancel} style={styles.action} />
            <Button
              label={confirmLabel}
              variant={confirmTone === "danger" ? "danger" : "primary"}
              onPress={onConfirm}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
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
  message: {
    fontSize: 14,
    color: uiColors.textMuted,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  action: {
    flex: 1,
  },
})
