import { Pressable, StyleSheet, Text, View } from "react-native"
import { Icon, uiColors } from "@shared/ui"

export function AccountDetailHeader({
  bankName,
  onBack,
  onRefresh,
  refreshPending = false,
}: {
  bankName: string
  onBack: () => void
  onRefresh?: () => void
  refreshPending?: boolean
}) {
  return (
    <View style={styles.topHeader}>
      <Pressable style={styles.backButton} onPress={onBack} accessibilityRole="button" accessibilityLabel="목록으로 이동">
        <Icon name="chevronLeft" size={18} color={uiColors.text} />
      </Pressable>
      <View style={styles.topHeaderTextWrap}>
        <Text style={styles.topHeaderTitle}>모임통장 상세</Text>
        <Text style={styles.topHeaderMeta}>{bankName}</Text>
      </View>
      <Pressable
        style={[styles.refreshButton, refreshPending && styles.refreshButtonDisabled]}
        onPress={onRefresh}
        disabled={refreshPending || !onRefresh}
        accessibilityRole="button"
        accessibilityLabel="상세 새로고침"
      >
        <Text style={styles.refreshText}>{refreshPending ? "갱신 중" : "새로고침"}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.surface,
    borderWidth: 1,
    borderColor: uiColors.border,
  },
  topHeaderTitle: {
    color: uiColors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  topHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  topHeaderMeta: {
    color: uiColors.textMuted,
    fontSize: 11,
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshText: {
    color: uiColors.text,
    fontSize: 11,
    fontWeight: "700",
  },
})
