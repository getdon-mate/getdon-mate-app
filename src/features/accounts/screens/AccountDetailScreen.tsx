import { useEffect, useMemo, useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAccounts, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { copyText } from "@shared/lib/clipboard"
import { Button, uiColors, uiTypography, uiSpacing } from "@shared/ui"
import { buildAccountInviteLink } from "@shared/lib/invite"
import { getCurrentMonthKey } from "@shared/lib/date"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { COPY } from "@shared/constants/copy"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { DashboardTab } from "../components/detail-tabs/DashboardTab"
import { DuesTab } from "../components/detail-tabs/DuesTab"
import { MembersTab } from "../components/detail-tabs/MembersTab"
import { SettingsTab } from "../components/detail-tabs/SettingsTab"
import { StatisticsTab } from "../components/detail-tabs/StatisticsTab"
import { TransactionsTab } from "../components/detail-tabs/TransactionsTab"
import { CalendarTab } from "../components/detail-tabs/CalendarTab"
import { BoardTab } from "../components/detail-tabs/BoardTab"
import { AccountDetailHeader } from "../components/detail/AccountDetailHeader"
import { AccountDetailHero } from "../components/detail/AccountDetailHero"
import { DetailTabBar, type DetailTab } from "../components/detail/DetailTabBar"
import type { TransactionType } from "../model/types"

const detailTabMemory = new Map<string, DetailTab>()
const DETAIL_TAB_MEMORY_LIMIT = 20

function rememberTab(accountId: string, tab: DetailTab) {
  detailTabMemory.set(accountId, tab)
  if (detailTabMemory.size > DETAIL_TAB_MEMORY_LIMIT) {
    const firstKey = detailTabMemory.keys().next().value
    if (firstKey !== undefined) detailTabMemory.delete(firstKey)
  }
}

export function AccountDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.AccountDetail>>()
  const { isBootstrapping, isRefreshingAccounts, prefersRealApi, lastSyncError, refreshAccounts, maskAmounts, toggleMaskAmounts } = useAppRuntime()
  const { accounts, selectedAccountId, clearSelectedAccount, selectAccount } = useAppAccounts()
  const { showAlert, showToast } = useFeedback()
  const { width } = useWindowDimensions()
  const isWide = width >= 1024

  const [tab, setTab] = useState<DetailTab>("dashboard")
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthKey())
  const [transactionComposerType, setTransactionComposerType] = useState<TransactionType>("income")
  const [transactionComposerSignal, setTransactionComposerSignal] = useState(0)

  const routeAccountId = route.params?.accountId

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
    rememberTab(account.id, tab)
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
    if (source === "remote") {
      showToast(feedbackPresets.refreshSuccess)
    } else if (prefersRealApi) {
      showToast(feedbackPresets.refreshFallback(lastSyncError))
    } else {
      showToast(feedbackPresets.refreshDemo)
    }
  }

  async function handleCopyInvite() {
    if (!account) return
    const inviteLink = buildAccountInviteLink(account)
    const copied = await copyText(inviteLink)
    if (copied) {
      showToast({ tone: "success", title: "링크 복사 완료", message: "초대 링크를 복사했습니다." })
      return
    }
    showAlert({ title: "복사 실패", message: "초대 링크를 복사하지 못했습니다.", tone: "danger" })
  }

  async function handleCopyAccountNumber() {
    if (!account) return
    const copied = await copyText(account.accountNumber)
    if (copied) {
      showToast({ tone: "success", title: "복사 완료", message: COPY.account.copyAccountNumber })
      return
    }
    showAlert({ title: "복사 실패", message: COPY.account.copyAccountNumberFail, tone: "danger" })
  }

  async function handleShareInvite() {
    if (!account) return
    try {
      const inviteLink = buildAccountInviteLink(account)
      await Share.share({
        message: `${account.groupName} 초대 링크\n${inviteLink}`,
        url: inviteLink,
        title: `${account.groupName} 초대`,
      })
    } catch {
      showAlert({ title: "공유 실패", message: "공유 시트를 열지 못했습니다.", tone: "danger" })
    }
  }

  if (!account) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>선택된 모임이 없습니다.</Text>
        <Text style={styles.emptyDescription}>목록에서 모임통장을 다시 선택해주세요.</Text>
        <Button
          label="목록으로 돌아가기"
          variant="secondary"
          onPress={() => navigation.navigate(ROUTES.AccountList)}
          style={styles.emptyBackButton}
        />
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
      <AccountDetailHero
        account={account}
        maskAmounts={maskAmounts}
        onToggleMask={toggleMaskAmounts}
        onCopyInvite={handleCopyInvite}
        onShareInvite={handleShareInvite}
        onPressAction={openTransactionComposer}
      />

      {tab === "transactions" ? (
        // TransactionsTab 은 자체 SectionList 스크롤 보유 → 외부 ScrollView 불필요
        <View style={[styles.flexFill, styles.transactionsWrap, isWide && styles.contentWrapWide]}>
          <TransactionsTab
            account={account}
            initialType={transactionComposerType}
            composerSignal={transactionComposerSignal}
          />
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
            {isBootstrapping ? (
              <>
                <LoadingStateCard />
                <LoadingStateCard />
              </>
            ) : tab === "dashboard" ? (
              <DashboardTab
                account={account}
                onOpenDues={() => setTab("dues")}
                onOpenTransactions={() => setTab("transactions")}
                onCopyAccountNumber={() => void handleCopyAccountNumber()}
              />
            ) : null}
            {tab === "dues" ? (
              isBootstrapping ? <LoadingStateCard lines={5} /> : <DuesTab account={account} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
            ) : null}
            {tab === "members" ? (
              isBootstrapping ? <LoadingStateCard lines={4} /> : <MembersTab account={account} />
            ) : null}
            {tab === "statistics" ? (
              isBootstrapping ? <LoadingStateCard lines={4} /> : <StatisticsTab account={account} />
            ) : null}
            {tab === "calendar" ? (
              isBootstrapping ? <LoadingStateCard lines={4} /> : <CalendarTab account={account} onOpenQuickAction={setTab} />
            ) : null}
            {tab === "board" ? (
              isBootstrapping ? <LoadingStateCard lines={4} /> : <BoardTab account={account} />
            ) : null}
            {tab === "settings" ? (
              isBootstrapping ? <LoadingStateCard lines={4} /> : <SettingsTab account={account} />
            ) : null}
          </View>
        </ScrollView>
      )}

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
    gap: uiSpacing.md,
    padding: uiSpacing.xl,
  },
  emptyBackButton: {
    marginTop: uiSpacing.sm,
    minWidth: 180,
  },
  emptyTitle: {
    ...uiTypography.section,
    color: uiColors.textStrong,
  },
  emptyDescription: {
    ...uiTypography.body,
    fontSize: 13,
  },
  content: {
    flex: 1,
    marginTop: uiSpacing.sm,
  },
  contentContainer: {
    paddingHorizontal: uiSpacing.md + 2,
    paddingBottom: uiSpacing.lg + 2,
  },
  contentWrap: {
    width: "100%",
    gap: uiSpacing.md,
  },
  contentWrapWide: {
    maxWidth: 980,
    alignSelf: "center",
  },
  flexFill: {
    flex: 1,
  },
  transactionsWrap: {
    alignSelf: "stretch",
  },
})
