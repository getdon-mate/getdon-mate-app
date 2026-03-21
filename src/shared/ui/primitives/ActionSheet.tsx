import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius, uiSpacing } from "../tokens"

export interface ActionSheetItem {
  label: string
  onPress: () => void
  tone?: "default" | "danger"
  disabled?: boolean
}

interface ActionSheetProps {
  visible: boolean
  title?: string
  items: ActionSheetItem[]
  onClose: () => void
}

export function ActionSheet({ visible, title, items, onClose }: ActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {items.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.item,
                index > 0 && styles.itemDivider,
                item.disabled && styles.itemDisabled,
              ]}
              onPress={() => {
                if (item.disabled) return
                onClose()
                item.onPress()
              }}
              disabled={item.disabled}
            >
              <Text style={[styles.itemText, item.tone === "danger" && styles.itemTextDanger]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={[styles.item, styles.cancelDivider]} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: uiColors.overlayStrong,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: uiColors.surface,
    borderTopLeftRadius: uiRadius.xl,
    borderTopRightRadius: uiRadius.xl,
    paddingBottom: uiSpacing.xxl,
    overflow: "hidden",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: uiColors.textMuted,
    textAlign: "center",
    paddingVertical: uiSpacing.md,
    paddingHorizontal: uiSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: 16,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  itemDisabled: { opacity: 0.4 },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: uiColors.textStrong,
  },
  itemTextDanger: { color: uiColors.danger },
  cancelDivider: {
    marginTop: uiSpacing.sm,
    borderTopWidth: 2,
    borderTopColor: uiColors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: uiColors.textMuted,
    textAlign: "center",
    flex: 1,
  },
})
