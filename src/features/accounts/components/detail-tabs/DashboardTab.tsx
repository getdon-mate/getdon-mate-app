import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { getCurrentMonthKey } from "@shared/lib/date"
import { ActionChip, uiRecipes } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import { getPaymentSummary, getRecentTransactions } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
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
  const [showBalance, setShowBalance] = useState(true)

  const currentMonth = getCurrentMonthKey()
  const { paid, payableMembers, progress, unpaidMembers } = getPaymentSummary(account, currentMonth)
  const recentTransactions = getRecentTransactions(account)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <Text style={styles.subtleText}>{account.bankName} {account.accountNumber}</Text>
        <Text style={styles.balanceLabel}>현재 잔액</Text>
        <Text style={styles.balanceText}>{showBalance ? formatKRW(account.balance) : "***,***원"}</Text>
        <ActionChip
          label={showBalance ? "잔액 숨기기" : "잔액 보기"}
          onPress={() => setShowBalance((prev) => !prev)}
          active={showBalance}
          style={styles.chipSelf}
        />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="회비 현황" actionLabel="자세히" onAction={onOpenDues} />
        <View style={styles.summaryPillRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>완납</Text>
            <Text style={styles.summaryPillValue}>{paid}명</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>진행률</Text>
            <Text style={styles.summaryPillValue}>{progress}%</Text>
          </View>
        </View>
        <Text style={styles.metricText}>{paid}/{payableMembers}명 완납 상태입니다.</Text>
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
        <SectionHeader title="최근 거래내역" actionLabel="더보기" onAction={onOpenTransactions} />
        {recentTransactions.length > 0 ? (
          <View style={styles.stackCompact}>
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} account={account} tx={tx} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>최근 거래내역이 없습니다.</Text>
            <Text style={styles.emptyDescription}>
              입금 또는 출금이 발생하면 이 영역에서 바로 확인할 수 있어요.
            </Text>
          </View>
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
    color: "#6b7280",
    fontSize: 12,
  },
  balanceLabel: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  balanceText: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
  },
  chipSelf: {
    alignSelf: "flex-start",
  },
  metricText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryPillRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 4,
  },
  rowBetween: uiRecipes.rowBetween,
  summaryPillLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryPillValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  unpaidRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  memberName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  unpaidBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  unpaidText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 4,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 17,
  },
})
