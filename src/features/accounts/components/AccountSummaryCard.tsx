import { Pressable, StyleSheet, Text, View } from "react-native"
import { formatKRW } from "../model/mock-data"
import { getPaymentSummary } from "../model/selectors"
import type { GroupAccount } from "../model/types"

export function AccountSummaryCard({
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
    <Pressable style={styles.accountCard} onPress={onPress}>
      <View style={styles.accountHeaderRow}>
        <Text style={styles.accountTitle}>{account.groupName}</Text>
        <Text style={styles.accountMembers}>{account.members.length}명</Text>
      </View>
      <Text style={styles.accountBalance}>{formatKRW(account.balance)}</Text>
      <Text style={styles.accountMeta}>
        {account.bankName} · {paid}/{account.members.length} 완납
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 6,
  },
  accountHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  accountMembers: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  accountBalance: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
  },
  accountMeta: {
    color: "#475569",
    fontSize: 12,
  },
})
