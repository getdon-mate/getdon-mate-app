import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { formatFullDate, formatKRW } from "../../model/mock-data"
import { getTransactionTotals, groupTransactionsByDate } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { TransactionRow } from "../TransactionRow"

export function TransactionsTab({ account }: { account: GroupAccount }) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")

  const filtered =
    filter === "all"
      ? account.transactions
      : account.transactions.filter((tx) => tx.type === filter)

  const { income, expense } = getTransactionTotals(account)
  const grouped = groupTransactionsByDate(filtered)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <View style={styles.stack}>
      <View style={styles.summaryRow}>
        <SectionCard>
          <Text style={styles.summaryLabel}>총 입금</Text>
          <Text style={[styles.metricText, styles.incomeText]}>+{formatKRW(income)}</Text>
        </SectionCard>
        <SectionCard>
          <Text style={styles.summaryLabel}>총 출금</Text>
          <Text style={[styles.metricText, styles.expenseText]}>-{formatKRW(expense)}</Text>
        </SectionCard>
      </View>

      <View style={styles.filterRow}>
        {(["all", "income", "expense"] as const).map((item) => {
          const active = filter === item
          return (
            <Pressable key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {item === "all" ? "전체" : item === "income" ? "입금" : "출금"}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {dates.length > 0 ? (
        dates.map((date) => (
          <SectionCard key={date}>
            <Text style={styles.subtleText}>{formatFullDate(date)}</Text>
            <View style={styles.stackCompact}>
              {grouped[date].map((tx) => (
                <TransactionRow key={tx.id} account={account} tx={tx} />
              ))}
            </View>
          </SectionCard>
        ))
      ) : (
        <EmptyStateCard
          title="표시할 거래내역이 없습니다."
          description="필터를 바꾸거나 새 거래를 추가하면 이 영역에 거래가 표시됩니다."
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  metricText: {
    fontSize: 16,
    fontWeight: "700",
  },
  incomeText: {
    color: "#16a34a",
  },
  expenseText: {
    color: "#111827",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d7dce5",
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  subtleText: {
    color: "#6b7280",
    fontSize: 12,
  },
})
