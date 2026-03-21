import { StyleSheet, Text, View } from "react-native"
import { getCurrentMonthKey } from "@shared/lib/date"
import { uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import { getPaymentSummary, getRecentTransactions } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionHeader } from "../SectionHeader"
import { SectionCard } from "../SectionCard"
import { TransactionRow } from "../TransactionRow"

export function DashboardTab({
  account,
  onOpenTransactions,
  onOpenDues,
}: {
  account: GroupAccount
  onOpenTransactions: () => void
  onOpenDues: () => void
}) {
  const currentMonth = getCurrentMonthKey()
  const { paid, payableMembers, progress, unpaidMembers } = getPaymentSummary(account, currentMonth)
  const recentTransactions = getRecentTransactions(account)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title="회비 현황" actionLabel="자세히" onAction={onOpenDues} />
        <View style={styles.summaryPillRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>완납</Text>
            <Text style={styles.summaryPillValue}>{paid}명</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>미납</Text>
            <Text style={styles.summaryPillValue}>{unpaidMembers.length}명</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>진행률</Text>
            <Text style={styles.summaryPillValue}>{progress}%</Text>
          </View>
        </View>
        <Text style={styles.metricText}>{paid}/{payableMembers}명 완납</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {unpaidMembers.length > 0 && (
          <View style={styles.stackCompact}>
            <Text style={styles.subtleText}>미납 멤버</Text>
            {unpaidMembers.map((record) => {
              const member = getMemberById(account.members, record.memberId)
              if (!member) return null
              return (
                <View key={record.memberId} style={styles.unpaidRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.unpaidBadge}>
                    <Text style={styles.unpaidText}>{formatKRW(record.amount)} 미납</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="최근 거래" actionLabel="더보기" onAction={onOpenTransactions} />
        {recentTransactions.length > 0 ? (
          <View style={styles.stackCompact}>
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} account={account} tx={tx} />
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="최근 거래가 없습니다."
            description="거래를 추가하면 여기서 바로 확인할 수 있습니다."
            actionLabel="거래 열기"
            onAction={onOpenTransactions}
          />
        )}
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  subtleText: {
    color: uiColors.textMuted,
    fontSize: 12,
  },
  metricText: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
  summaryPillRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    borderRadius: uiRadius.md,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.md,
    backgroundColor: uiColors.backgroundScreen,
    borderWidth: 1,
    borderColor: uiColors.border,
    gap: 4,
  },
  summaryPillLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryPillValue: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: uiRadius.full,
    backgroundColor: uiColors.border,
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: uiColors.primary,
    borderRadius: uiRadius.full,
  },
  unpaidRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  memberName: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
  unpaidBadge: {
    borderRadius: uiRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: uiColors.dangerSoft,
    borderWidth: 1,
    borderColor: uiColors.dangerBorder,
  },
  unpaidText: {
    color: uiColors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
})
