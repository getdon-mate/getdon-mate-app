import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { formatFullDate, formatKRW } from "../../model/mock-data"
import { getTransactionTotals, groupTransactionsByDate } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
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
      <SectionCard>
        <Text style={styles.metricText}>총 입금 +{formatKRW(income)}</Text>
        <Text style={styles.metricText}>총 출금 -{formatKRW(expense)}</Text>
      </SectionCard>

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

      {dates.map((date) => (
        <SectionCard key={date}>
          <Text style={styles.subtleText}>{formatFullDate(date)}</Text>
          <View style={styles.stackCompact}>
            {grouped[date].map((tx) => (
              <TransactionRow key={tx.id} account={account} tx={tx} />
            ))}
          </View>
        </SectionCard>
      ))}
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
  metricText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  subtleText: {
    color: "#64748b",
    fontSize: 12,
  },
})
