import { useEffect, useMemo, useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAccounts, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { uiColors } from "@shared/ui"
import { availableMonths } from "../model/fixtures"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { DashboardTab } from "../components/detail-tabs/DashboardTab"
import { DuesTab } from "../components/detail-tabs/DuesTab"
import { MembersTab } from "../components/detail-tabs/MembersTab"
import { SettingsTab } from "../components/detail-tabs/SettingsTab"
import { TransactionsTab } from "../components/detail-tabs/TransactionsTab"
import { AccountDetailHeader } from "../components/detail/AccountDetailHeader"
import { AccountDetailHero } from "../components/detail/AccountDetailHero"
import { DetailTabBar, type DetailTab } from "../components/detail/DetailTabBar"
import type { TransactionType } from "../model/types"

const detailTabMemory = new Map<string, DetailTab>()

export function AccountDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { isBootstrapping, isRefreshingAccounts, prefersRealApi, lastSyncError, refreshAccounts } = useAppRuntime()
  const { accounts, selectedAccountId, clearSelectedAccount, selectAccount } = useAppAccounts()
  const { showToast } = useFeedback()
  const { width } = useWindowDimensions()
  const isWide = width >= 1024

  const [tab, setTab] = useState<DetailTab>("dashboard")
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])
  const [transactionComposerType, setTransactionComposerType] = useState<TransactionType>("income")
  const [transactionComposerSignal, setTransactionComposerSignal] = useState(0)

  const routeAccountId = (route.params as { accountId?: string } | undefined)?.accountId

  useEffect(() => {
    if (!routeAccountId) return
    if (!accounts.some((candidate) => candidate.id === routeAccountId)) return
    if (selectedAccountId !== routeAccountId) {
      selectAccount(routeAccountId)
    }
  }, [accounts, routeAccountId, selectAccount, selectedAccountId])

  const account = useMemo(() => {
    if (selectedAccountId) {
      const selected = accounts.find((candidate) => candidate.id === selectedAccountId)
      if (selected) return selected
    }
    if (routeAccountId) {
      return accounts.find((candidate) => candidate.id === routeAccountId)
    }
    return undefined
  }, [accounts, routeAccountId, selectedAccountId])

  useEffect(() => {
    if (!account) return
    setTab(detailTabMemory.get(account.id) ?? "dashboard")
  }, [account?.id])

  useEffect(() => {
    if (!account) return
    detailTabMemory.set(account.id, tab)
  }, [account, tab])

  function goToList() {
    clearSelectedAccount()
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    navigation.navigate(ROUTES.AccountList)
  }

  function openTransactionComposer(type: TransactionType) {
    setTransactionComposerType(type)
    setTransactionComposerSignal((prev) => prev + 1)
    setTab("transactions")
  }

  async function handleRefresh() {
    const source = await refreshAccounts()
    showToast({
      tone: source === "remote" ? "success" : "warning",
      title: source === "remote" ? "상세 데이터 갱신 완료" : prefersRealApi ? "재시도 필요" : "데모 데이터 유지",
      message:
        source === "remote"
          ? "계좌 상세 데이터를 다시 동기화했습니다."
          : prefersRealApi
            ? (lastSyncError ?? "실서버 연결에 실패했습니다. 다시 시도해주세요.")
            : "현재는 데모 모드로 동작 중입니다.",
    })
  }

  if (!account) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>선택된 모임이 없습니다.</Text>
        <Text style={styles.emptyDescription}>목록에서 모임통장을 선택하면 상세 화면이 열립니다.</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <AccountDetailHeader
        bankName={account.bankName}
        onBack={goToList}
        onRefresh={() => void handleRefresh()}
        refreshPending={isRefreshingAccounts}
        refreshLabel={prefersRealApi && lastSyncError ? "재시도" : "새로고침"}
      />
      <AccountDetailHero account={account} onPressAction={openTransactionComposer} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
          {isBootstrapping ? (
            <>
              <LoadingStateCard />
              <LoadingStateCard />
            </>
          ) : tab === "dashboard" ? (
            <DashboardTab account={account} onOpenDues={() => setTab("dues")} onOpenTransactions={() => setTab("transactions")} />
          ) : null}
          {tab === "dues" ? <DuesTab account={account} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} /> : null}
          {tab === "transactions" ? (
            <TransactionsTab account={account} initialType={transactionComposerType} composerSignal={transactionComposerSignal} />
          ) : null}
          {tab === "members" ? <MembersTab account={account} /> : null}
          {tab === "settings" ? <SettingsTab account={account} /> : null}
        </View>
      </ScrollView>

      <DetailTabBar activeTab={tab} onChangeTab={setTab} />
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
    gap: 6,
    padding: 20,
  },
  emptyTitle: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDescription: {
    color: uiColors.textMuted,
    fontSize: 13,
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  contentWrap: {
    width: "100%",
    gap: 12,
  },
  contentWrapWide: {
    maxWidth: 980,
    alignSelf: "center",
  },
})
