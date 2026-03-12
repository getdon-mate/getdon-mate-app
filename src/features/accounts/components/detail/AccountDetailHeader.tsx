import { Pressable, StyleSheet, Text, View } from "react-native"
import { Icon, uiColors } from "@shared/ui"

export function AccountDetailHeader({
  bankName,
  onBack,
}: {
  bankName: string
  onBack: () => void
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
})
