import { useMemo, useState } from "react"
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
import { getCurrentMonthKey } from "@shared/lib/date"
import { ActionChip, Button, Icon, uiColors, uiSpacing } from "@shared/ui"
import { onlyDigits } from "@shared/lib/validation"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"
import { getHomeAccounts, getPaymentSummary } from "../model/selectors"

type HomeFilter = "all" | "attention"

export function AccountListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser } = useAppAuth()
  const { accounts, selectAccount } = useAppAccounts()
  const { isBootstrapping, isRefreshingAccounts, refreshAccounts, unreadNotificationCount, maskAmounts, toggleMaskAmounts } = useAppRuntime()
  const { showToast } = useFeedback()
  const currentMonth = getCurrentMonthKey()
  const { width } = useWindowDimensions()
  const isWide = width >= 960
  const compact = width < 390
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<HomeFilter>("all")

  const initials = useMemo(() => currentUser?.name.slice(-2) ?? "??", [currentUser])
  const orderedAccounts = useMemo(() => getHomeAccounts(accounts), [accounts])
  const visibleAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const digitQuery = onlyDigits(query)

    return orderedAccounts.filter((account) => {
      const matchesFilter =
        filter === "attention" ? getPaymentSummary(account, currentMonth).unpaid >= 2 : true
      if (!matchesFilter) return false
      if (!query) return true

      const accountText = [account.groupName, account.bankName, account.accountNumber].join(" ").toLowerCase()
      return accountText.includes(query) || (digitQuery.length > 0 && onlyDigits(account.accountNumber).includes(digitQuery))
    })
  }, [currentMonth, filter, orderedAccounts, searchQuery])
  const hasActiveFilter = filter !== "all" || Boolean(searchQuery.trim())

  async function handleRefresh() {
    const source = await refreshAccounts()
    showToast({
      tone: source === "remote" ? "success" : "warning",
      title: source === "remote" ? "목록 동기화 완료" : "데모 데이터 유지",
      message: source === "remote" ? "모임통장 목록을 최신 상태로 불러왔습니다." : "현재는 데모 데이터로 목록을 유지하고 있습니다.",
    })
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
            <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}></Text>
            <Text style={styles.sectionSubtitle}></Text>
          </View>
        </View>
        <View style={styles.searchStack}>
          <View testID="account-list-filter-actions" style={styles.filterActionsRow}>
            <View style={styles.filterRow}>
              <ActionChip label="전체" active={filter === "all"} onPress={() => setFilter("all")} />
              <ActionChip label="미납 2명+" active={filter === "attention"} onPress={() => setFilter("attention")} />
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
        </View>

        {isBootstrapping ? (
          <>
            <LoadingStateCard />
            <LoadingStateCard />
          </>
        ) : visibleAccounts.length > 0 ? (
          visibleAccounts.map((account) => (
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
        ) : hasActiveFilter ? (
          <EmptyStateCard
            title="조건에 맞는 모임통장이 없습니다."
            description="검색어나 필터를 조정해보세요."
            actionLabel="필터 초기화"
            onAction={() => {
              setSearchQuery("")
              setFilter("all")
            }}
          />
        ) : (
          <EmptyStateCard
            title="아직 모임통장이 없습니다."
            description="새 모임통장을 열고 회비 관리를 시작하세요."
            actionLabel="모임통장 만들기"
            onAction={() => navigation.navigate(ROUTES.AccountCreate)}
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
    gap: 14,
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
  searchStack: {
    gap: 8,
  },
  searchField: {
    gap: 4,
  },
  filterActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
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
