import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useApp } from "@core/providers/AppProvider"
import { uiColors } from "@shared/ui"
import {
  availableMonths,
} from "../model/mock-data"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { DashboardTab } from "../components/detail-tabs/DashboardTab"
import { DuesTab } from "../components/detail-tabs/DuesTab"
import { MembersTab } from "../components/detail-tabs/MembersTab"
import { SettingsTab } from "../components/detail-tabs/SettingsTab"
import { TransactionsTab } from "../components/detail-tabs/TransactionsTab"
import type { TransactionType } from "../model/types"

type DetailTab = "dashboard" | "dues" | "transactions" | "members" | "settings"

const tabs: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "홈" },
  { key: "dues", label: "회비" },
  { key: "transactions", label: "거래" },
  { key: "members", label: "멤버" },
  { key: "settings", label: "관리" },
]

export function AccountDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { isBootstrapping, accounts, selectedAccountId, clearSelectedAccount } = useApp()

  const [tab, setTab] = useState<DetailTab>("dashboard")
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])
  const [transactionComposerType, setTransactionComposerType] = useState<TransactionType>("income")
  const [transactionComposerSignal, setTransactionComposerSignal] = useState(0)

  const account = useMemo(
    () => accounts.find((candidate) => candidate.id === selectedAccountId),
    [accounts, selectedAccountId]
  )

  function goToList() {
    setTab("dashboard")
    clearSelectedAccount()
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    navigation.navigate("AccountList")
  }

  function openTransactionComposer(type: TransactionType) {
    setTransactionComposerType(type)
    setTransactionComposerSignal((prev) => prev + 1)
    setTab("transactions")
  }

  if (!account) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>선택된 모임이 없습니다.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            clearSelectedAccount()
            navigation.navigate("AccountList")
          }}
        >
          <Text style={styles.primaryButtonText}>목록으로</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topHeader}>
        <Pressable style={styles.backButton} onPress={goToList}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.topHeaderTextWrap}>
          <Text style={styles.topHeaderTitle}>모임통장 상세</Text>
          <Text style={styles.topHeaderMeta}>{account.bankName}</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIdentityRow}>
          <Text style={styles.heroIcon}>{account.groupName.slice(0, 1)}</Text>
          <View style={styles.heroTitleWrap}>
            <Text style={styles.heroTitle}>{account.groupName}</Text>
            <Text style={styles.heroMeta}>모임원 {account.members.length}명</Text>
          </View>
        </View>
        <Text style={styles.heroBalanceLabel}>총 잔액</Text>
        <Text style={styles.heroBalanceText}>₩ {account.balance.toLocaleString("ko-KR")}</Text>
        <View style={styles.heroActionRow}>
          <Pressable style={styles.heroGhostButton} onPress={() => openTransactionComposer("income")}>
            <Text style={styles.heroGhostButtonText}>채우기</Text>
          </Pressable>
          <Pressable style={styles.heroPrimaryButton} onPress={() => openTransactionComposer("expense")}>
            <Text style={styles.heroPrimaryButtonText}>보내기</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isBootstrapping ? (
          <>
            <LoadingStateCard />
            <LoadingStateCard />
          </>
        ) : tab === "dashboard" && (
          <DashboardTab
            account={account}
            onOpenDues={() => setTab("dues")}
            onOpenTransactions={() => setTab("transactions")}
          />
        )}
        {tab === "dues" && (
          <DuesTab account={account} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        )}
        {tab === "transactions" && (
          <TransactionsTab
            account={account}
            initialType={transactionComposerType}
            composerSignal={transactionComposerSignal}
          />
        )}
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
    backgroundColor: uiColors.background,
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
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  backButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  topHeaderTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  topHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  topHeaderMeta: {
    color: "#6b7280",
    fontSize: 11,
  },
  heroCard: {
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: 26,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  heroIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.24)",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 6,
  },
  heroTitleWrap: {
    gap: 1,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  heroMeta: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "500",
  },
  heroBalanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  heroBalanceText: {
    color: "#ffffff",
    fontSize: 31,
    fontWeight: "800",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  heroGhostButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  heroGhostButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  heroPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  heroPrimaryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#eef1f5",
    paddingVertical: 8,
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
    color: uiColors.primary,
  },
  stack: {
    gap: 12,
  },
})
