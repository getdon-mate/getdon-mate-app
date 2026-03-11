import { useMemo, useState } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useApp } from "@core/providers/AppProvider"
import {
  availableMonths,
} from "../model/mock-data"
import type { GroupAccount } from "../model/types"
import { DashboardTab } from "../components/detail-tabs/DashboardTab"
import { DuesTab } from "../components/detail-tabs/DuesTab"
import { MembersTab } from "../components/detail-tabs/MembersTab"
import { SettingsTab } from "../components/detail-tabs/SettingsTab"
import { TransactionsTab } from "../components/detail-tabs/TransactionsTab"

type DetailTab = "dashboard" | "dues" | "transactions" | "members" | "settings"

const tabs: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "홈" },
  { key: "dues", label: "회비" },
  { key: "transactions", label: "거래" },
  { key: "members", label: "멤버" },
  { key: "settings", label: "관리" },
]

export function AccountDetailScreen() {
  const { accounts, selectedAccountId, setCurrentView } = useApp()

  const [tab, setTab] = useState<DetailTab>("dashboard")
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])

  const account = useMemo(
    () => accounts.find((candidate) => candidate.id === selectedAccountId),
    [accounts, selectedAccountId]
  )

  if (!account) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>선택된 모임이 없습니다.</Text>
        <Pressable style={styles.primaryButton} onPress={() => setCurrentView("account-list")}>
          <Text style={styles.primaryButtonText}>목록으로</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            setTab("dashboard")
            setCurrentView("account-list")
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.topHeaderTitle}>{account.groupName}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {tab === "dashboard" && (
          <DashboardTab
            account={account}
            onOpenDues={() => setTab("dues")}
            onOpenTransactions={() => setTab("transactions")}
          />
        )}
        {tab === "dues" && (
          <DuesTab account={account} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        )}
        {tab === "transactions" && <TransactionsTab account={account} />}
        {tab === "members" && <MembersTab account={account} />}
        {tab === "settings" && <SettingsTab account={account} />}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((item) => {
          const active = tab === item.key
          return (
            <Pressable key={item.key} style={styles.navItem} onPress={() => setTab(item.key)}>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 20,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  backButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "700",
  },
  topHeaderTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 18,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  navLabelActive: {
    color: "#2563eb",
  },
  stack: {
    gap: 12,
  },
})
