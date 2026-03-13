import { memo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Icon, uiColors } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import { getPaymentSummary } from "../model/selectors"
import type { GroupAccount } from "../model/types"

export const AccountSummaryCard = memo(function AccountSummaryCard({
  account,
  currentMonth,
  onPress,
}: {
  account: GroupAccount
  currentMonth: string
  onPress: () => void
}) {
  const { paid } = getPaymentSummary(account, currentMonth)

  return (
    <Pressable style={styles.accountCard} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${account.groupName} 상세 열기`}>
      <View style={styles.accountHeaderRow}>
        <View style={styles.identityWrap}>
          <View style={styles.iconBubble}>
            <Text style={styles.iconText}>{account.groupName.slice(0, 1)}</Text>
          </View>
          <View style={styles.identityTextWrap}>
            <Text style={styles.accountTitle}>{account.groupName}</Text>
            <Text style={styles.accountMembers}>참여 멤버 {account.members.length}명</Text>
          </View>
        </View>
        <Icon name="chevronRight" size={22} color={uiColors.textSoft} />
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.accountMeta}>잔액</Text>
        <Text style={styles.accountBalance}>{formatKRW(account.balance)}</Text>
      </View>
      <Text style={styles.accountSubMeta}>
        {account.bankName} · {paid}/{account.members.length} 완납
      </Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  accountCard: {
    backgroundColor: uiColors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: uiColors.border,
    padding: 18,
    gap: 12,
    position: "relative",
    shadowColor: uiColors.textStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  accountHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  identityWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: uiColors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: uiColors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  identityTextWrap: {
    gap: 2,
    flex: 1,
  },
  accountTitle: {
    color: uiColors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  accountMembers: {
    color: uiColors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  accountBalance: {
    color: uiColors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  accountMeta: {
    color: uiColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  accountSubMeta: {
    color: uiColors.textMuted,
    fontSize: 13,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
})
