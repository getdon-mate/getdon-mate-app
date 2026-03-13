import { useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAccounts, useAppAuth, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { appEnv } from "@shared/config/app-env"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { getCurrentMonthKey } from "@shared/lib/date"
import { Button, Icon, uiColors, uiSpacing } from "@shared/ui"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"

export function AccountListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser } = useAppAuth()
  const { accounts, selectAccount, resetDemoData } = useAppAccounts()
  const { isBootstrapping, dataSource, isRefreshingAccounts, refreshAccounts } = useAppRuntime()
  const { confirmDanger, showToast } = useFeedback()
  const currentMonth = getCurrentMonthKey()
  const { width } = useWindowDimensions()
  const isWide = width >= 960

  const initials = useMemo(() => currentUser?.name.slice(-2) ?? "??", [currentUser])

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

  async function handleRefresh() {
    await refreshAccounts()
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshingAccounts}
          onRefresh={() => void handleRefresh()}
          tintColor={uiColors.primary}
        />
      }
    >
      <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
        <UserHeaderCard
          user={currentUser}
          initials={initials}
          onOpenNotifications={() => navigation.navigate(ROUTES.NotificationList)}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={styles.sectionTitle}>모임통장</Text>
            <Text style={styles.sectionSubtitle}>내 모임통장 {accounts.length}개</Text>
          </View>
          <Pressable
            style={[styles.headerIconButton, isRefreshingAccounts && styles.headerIconButtonDisabled]}
            onPress={() => void handleRefresh()}
            accessibilityRole="button"
            accessibilityLabel="모임통장 목록 새로고침"
            disabled={isRefreshingAccounts}
          >
            <Icon name="refresh" size={18} color={uiColors.text} />
          </Pressable>
        </View>

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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.md,
  },
  sectionHeaderCopy: {
    gap: 2,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: uiColors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: uiColors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.35,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  headerIconButtonDisabled: {
    opacity: 0.45,
  },
  addCard: {
    borderStyle: "dashed",
  },
  resetCard: {
    marginTop: -2,
  },
})
