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
      <Text style={styles.accountChevron}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6e9ef",
    padding: 18,
    gap: 8,
    position: "relative",
  },
  accountHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  accountMembers: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  accountBalance: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800",
  },
  accountMeta: {
    color: "#64748b",
    fontSize: 13,
  },
  accountChevron: {
    position: "absolute",
    right: 16,
    top: 18,
    fontSize: 22,
    color: "#c5cad3",
  },
})
