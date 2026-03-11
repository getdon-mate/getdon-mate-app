import { StyleSheet, Text, View } from "react-native"
import { formatDate, formatKRW, getMemberById } from "../model/mock-data"
import type { GroupAccount, Transaction } from "../model/types"

export function TransactionRow({ account, tx }: { account: GroupAccount; tx: Transaction }) {
  const member = tx.memberId ? getMemberById(account.members, tx.memberId) : undefined

  return (
    <View style={styles.rowBetween}>
      <View style={styles.stackTiny}>
        <Text style={styles.memberName}>
          {tx.description}
          {member ? ` - ${member.name}` : ""}
        </Text>
        <Text style={styles.memberMeta}>{tx.category} · {formatDate(tx.date)}</Text>
      </View>
      <Text style={[styles.transactionAmount, tx.type === "income" ? styles.incomeText : styles.expenseText]}>
        {tx.type === "income" ? "+" : "-"}
        {formatKRW(tx.amount)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 4,
  },
  stackTiny: {
    gap: 2,
    flexShrink: 1,
  },
  memberName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  memberMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  incomeText: {
    color: "#16a34a",
  },
  expenseText: {
    color: "#0f172a",
  },
})
