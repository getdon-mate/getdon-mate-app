import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { getCurrentMonthKey } from "@shared/lib/date"
import { getMemberById, formatKRW } from "../../model/mock-data"
import { getPaymentSummary, getRecentTransactions } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
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
        <Pressable style={styles.smallOutlineButton} onPress={() => setShowBalance((prev) => !prev)}>
          <Text style={styles.smallOutlineButtonText}>{showBalance ? "잔액 숨기기" : "잔액 보기"}</Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>회비 현황</Text>
          <Pressable onPress={onOpenDues}>
            <Text style={styles.linkText}>자세히</Text>
          </Pressable>
        </View>
        <Text style={styles.metricText}>{paid}/{payableMembers}명 완납 ({progress}%)</Text>
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
                <View key={record.memberId} style={styles.rowBetween}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.unpaidText}>{formatKRW(record.amount)} 미납</Text>
                </View>
              )
            })}
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>최근 거래내역</Text>
          <Pressable onPress={onOpenTransactions}>
            <Text style={styles.linkText}>더보기</Text>
          </Pressable>
        </View>
        <View style={styles.stackCompact}>
          {recentTransactions.map((tx) => (
            <TransactionRow key={tx.id} account={account} tx={tx} />
          ))}
        </View>
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  stackCompact: {
    gap: 8,
    marginTop: 8,
  },
  subtleText: {
    color: "#64748b",
    fontSize: 12,
  },
  balanceLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  balanceText: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "800",
  },
  smallOutlineButton: {
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  smallOutlineButtonText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  linkText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  metricText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  memberName: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  unpaidText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
})
