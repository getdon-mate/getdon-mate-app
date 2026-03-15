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
import { getCurrentMonthKey } from "@shared/lib/date"
import { Button, Icon, uiColors, uiSpacing } from "@shared/ui"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"
import { getHomeAccounts } from "../model/selectors"

export function AccountListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser } = useAppAuth()
  const { accounts, selectAccount } = useAppAccounts()
  const { isBootstrapping, isRefreshingAccounts, refreshAccounts, unreadNotificationCount, maskAmounts, toggleMaskAmounts } = useAppRuntime()
  const currentMonth = getCurrentMonthKey()
  const { width } = useWindowDimensions()
  const isWide = width >= 960
  const compact = width < 390

  const initials = useMemo(() => currentUser?.name.slice(-2) ?? "??", [currentUser])
  const orderedAccounts = useMemo(() => getHomeAccounts(accounts), [accounts])

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
          unreadNotificationCount={unreadNotificationCount}
          maskAmounts={maskAmounts}
          onToggleMaskAmounts={toggleMaskAmounts}
          onOpenNotifications={() => navigation.navigate(ROUTES.NotificationList)}
          onOpenMyPage={() => navigation.navigate(ROUTES.MyPage)}
          onOpenAppSettings={() => navigation.navigate(ROUTES.AppSettings)}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>모임통장</Text>
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
        ) : orderedAccounts.length > 0 ? (
          orderedAccounts.map((account) => (
            <AccountSummaryCard
              key={account.id}
              account={account}
              currentMonth={currentMonth}
              maskAmounts={maskAmounts}
              onPress={() => {
                selectAccount(account.id)
                navigation.navigate(ROUTES.AccountDetail, { accountId: account.id })
              }}
            />
          ))
        ) : (
          <EmptyStateCard
            title="아직 모임통장이 없습니다."
            description="새 모임통장을 열고 회비 관리를 시작하세요."
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
  sectionTitleCompact: {
    fontSize: 18,
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
})
