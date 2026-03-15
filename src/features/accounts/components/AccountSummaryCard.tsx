import { memo } from "react"
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { AmountMask, Icon, uiColors } from "@shared/ui"
import { formatDate, formatKRW } from "@shared/lib/format"
import { getPaymentSummary } from "../model/selectors"
import type { GroupAccount } from "../model/types"

export const AccountSummaryCard = memo(function AccountSummaryCard({
  account,
  currentMonth,
  maskAmounts,
  onPress,
}: {
  account: GroupAccount
  currentMonth: string
  maskAmounts: boolean
  onPress: () => void
}) {
  const { width } = useWindowDimensions()
  const compact = width < 390
  const { paid, unpaid } = getPaymentSummary(account, currentMonth)
  const needsAttention = unpaid >= 2
  const statusLabel = needsAttention ? "정산 필요" : "안정"
  const detailLabel = unpaid > 0 ? `미납 ${unpaid}명` : "이번 달 회비 완료"
  const latestActivityDate =
    [...account.transactions.map((tx) => tx.date), ...account.boardPosts.map((post) => post.createdAt.slice(0, 10))]
      .sort((a, b) => b.localeCompare(a))[0] ?? null

  return (
    <Pressable
      style={[styles.accountCard, compact && styles.accountCardCompact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${account.groupName} 상세 열기`}
    >
      <View style={styles.accountHeaderRow}>
        <View style={styles.identityWrap}>
          <View style={[styles.iconBubble, compact && styles.iconBubbleCompact]}>
            <Text style={[styles.iconText, compact && styles.iconTextCompact]}>{account.groupName.slice(0, 1)}</Text>
          </View>
          <View style={styles.identityTextWrap}>
            <Text style={[styles.accountTitle, compact && styles.accountTitleCompact]}>{account.groupName}</Text>
            <Text style={[styles.accountMembers, compact && styles.accountMembersCompact]}>참여 멤버 {account.members.length}명</Text>
          </View>
        </View>
        <Icon name="chevronRight" size={22} color={uiColors.textSoft} />
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.accountMeta, compact && styles.accountMetaCompact]}>잔액</Text>
        <AmountMask
          value={formatKRW(account.balance)}
          masked={maskAmounts}
          textStyle={[styles.accountBalance, compact && styles.accountBalanceCompact]}
          skeletonHeight={compact ? 22 : 26}
        />
      </View>
      <Text style={[styles.accountSubMeta, compact && styles.accountSubMetaCompact]}>
        {account.bankName} · {paid}/{account.members.length} 완납
      </Text>
      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, needsAttention ? styles.statusBadgeWarning : styles.statusBadgeStable]}>
          <Text style={[styles.statusBadgeText, needsAttention ? styles.statusBadgeTextWarning : styles.statusBadgeTextStable]}>
            {statusLabel}
          </Text>
        </View>
        <View style={styles.badgeMetaWrap}>
          <Text style={styles.detailMeta}>{detailLabel}</Text>
          {latestActivityDate ? <Text style={styles.activityMeta}>최근 {formatDate(latestActivityDate)}</Text> : null}
        </View>
      </View>
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
  accountCardCompact: {
    borderRadius: 20,
    padding: 15,
    gap: 10,
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
  iconBubbleCompact: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  iconText: {
    color: uiColors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  iconTextCompact: {
    fontSize: 16,
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
  accountTitleCompact: {
    fontSize: 16,
  },
  accountMembers: {
    color: uiColors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  accountMembersCompact: {
    fontSize: 12,
  },
  accountBalance: {
    color: uiColors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  accountBalanceCompact: {
    fontSize: 24,
  },
  accountMeta: {
    color: uiColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  accountMetaCompact: {
    fontSize: 12,
  },
  accountSubMeta: {
    color: uiColors.textMuted,
    fontSize: 13,
  },
  accountSubMetaCompact: {
    fontSize: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badgeMetaWrap: {
    alignItems: "flex-end",
    gap: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusBadgeWarning: {
    backgroundColor: uiColors.warningSoft,
    borderColor: uiColors.warningBorder,
  },
  statusBadgeStable: {
    backgroundColor: uiColors.primarySoft,
    borderColor: uiColors.primaryBorder,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusBadgeTextWarning: {
    color: uiColors.warning,
  },
  statusBadgeTextStable: {
    color: uiColors.primary,
  },
  activityMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  detailMeta: {
    color: uiColors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
})
