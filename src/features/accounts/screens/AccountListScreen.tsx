import { useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native"
import { apiConfig } from "@core/api"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAccounts, useAppAuth, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { appEnv } from "@shared/config/app-env"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { getCurrentMonthKey } from "@shared/lib/date"
import { Button, PageHeader, StatusBanner, uiColors, uiSpacing } from "@shared/ui"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"

export function AccountListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser, logout, withdraw } = useAppAuth()
  const { accounts, selectAccount, resetDemoData } = useAppAccounts()
  const {
    isBootstrapping,
    dataSource,
    prefersRealApi,
    lastSyncError,
    isRefreshingAccounts,
    refreshAccounts,
  } = useAppRuntime()
  const { confirm, confirmDanger, showToast } = useFeedback()
  const currentMonth = getCurrentMonthKey()
  const { width } = useWindowDimensions()
  const isWide = width >= 960

  const initials = useMemo(() => currentUser?.name.slice(-2) ?? "??", [currentUser])

  async function handleWithdraw() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.withdraw.title,
      message: feedbackPresets.withdraw.message,
      confirmLabel: feedbackPresets.withdraw.confirmLabel,
    })
    if (!confirmed) return
    withdraw()
    showToast({ tone: "success", title: feedbackPresets.withdraw.successTitle, message: feedbackPresets.withdraw.successMessage })
  }

  async function handleResetDemoData() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.resetDemoData.title,
      message: feedbackPresets.resetDemoData.message,
      confirmLabel: feedbackPresets.resetDemoData.confirmLabel,
    })
    if (!confirmed) return
    resetDemoData()
    showToast({
      tone: "success",
      title: feedbackPresets.resetDemoData.successTitle,
      message: feedbackPresets.resetDemoData.successMessage,
    })
  }

  async function handleLogout() {
    const confirmed = await confirm({
      title: feedbackPresets.logout.title,
      message: feedbackPresets.logout.message,
      confirmLabel: feedbackPresets.logout.confirmLabel,
    })
    if (!confirmed) return
    logout()
    showToast({ tone: "success", title: feedbackPresets.logout.successTitle, message: feedbackPresets.logout.successMessage })
  }

  async function handleRefresh() {
    const source = await refreshAccounts()
    showToast({
      tone: source === "remote" ? "success" : "warning",
      title: source === "remote" ? "데이터 새로고침 완료" : prefersRealApi ? "재시도 필요" : "데모 데이터 유지",
      message:
        source === "remote"
          ? "최신 계좌 데이터를 다시 불러왔습니다."
          : prefersRealApi
            ? (lastSyncError ?? "실서버 연결에 실패했습니다. 다시 시도해주세요.")
            : "현재는 데모 모드로 동작 중입니다.",
    })
  }

  const statusMessage = useMemo(() => {
    const baseUrlLabel = apiConfig.baseUrl ? "설정됨" : "미설정"
    const modeLabel = `mode=${apiConfig.mode}`
    if (dataSource === "remote") {
      return `세션과 계좌 목록을 서버 기준으로 불러왔습니다. (${modeLabel}, baseUrl ${baseUrlLabel})`
    }
    if (prefersRealApi && lastSyncError) {
      return `${lastSyncError} (${modeLabel}, baseUrl ${baseUrlLabel})`
    }
    return `현재 화면은 로컬 mock 데이터를 기준으로 동작합니다. (${modeLabel}, baseUrl ${baseUrlLabel})`
  }, [dataSource, lastSyncError, prefersRealApi])

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
        <UserHeaderCard user={currentUser} initials={initials} onWithdraw={() => void handleWithdraw()} onLogout={() => void handleLogout()} />
        <StatusBanner
          title={dataSource === "remote" ? "백엔드 연결 완료" : prefersRealApi ? "데모 데이터 fallback" : "데모 데이터 사용 중"}
          message={statusMessage}
          tone={dataSource === "remote" ? "info" : "warning"}
          showMessage
        />
        <Button
          label={isRefreshingAccounts ? "새로고침 중..." : prefersRealApi && lastSyncError ? "재시도" : "목록 새로고침"}
          variant="ghost"
          onPress={() => void handleRefresh()}
          disabled={isRefreshingAccounts}
        />

        <PageHeader title="모임통장" subtitle={`내 모임통장 ${accounts.length}개`} />

        {isBootstrapping ? (
          <>
            <LoadingStateCard />
            <LoadingStateCard />
          </>
        ) : accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountSummaryCard
              key={account.id}
              account={account}
              currentMonth={currentMonth}
              onPress={() => {
                selectAccount(account.id)
                navigation.navigate(ROUTES.AccountDetail, { accountId: account.id })
              }}
            />
          ))
        ) : (
          <EmptyStateCard
            title="아직 모임통장이 없습니다."
            description="새 모임통장을 개설해 회비와 거래 관리를 시작해보세요."
          />
        )}

        {!isBootstrapping ? (
          <Button
            style={styles.addCard}
            variant="secondary"
            label="+ 새 모임통장 개설"
            onPress={() => navigation.navigate(ROUTES.AccountCreate)}
          />
        ) : null}

        {!isBootstrapping && appEnv.showDemoControls && dataSource !== "remote" ? (
          <Button
            style={styles.resetCard}
            variant="danger"
            label="데모 데이터 초기화"
            onPress={handleResetDemoData}
          />
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  content: {
    paddingHorizontal: uiSpacing.lg,
    paddingTop: uiSpacing.md,
    paddingBottom: 30,
  },
  contentWrap: {
    gap: uiSpacing.lg,
    width: "100%",
  },
  contentWrapWide: {
    alignSelf: "center",
    maxWidth: 920,
  },
  addCard: {
    borderStyle: "dashed",
  },
  resetCard: {
    marginTop: -2,
  },
})
