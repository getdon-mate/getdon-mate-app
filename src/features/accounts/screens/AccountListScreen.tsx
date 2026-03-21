import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAccounts, useAppAuth, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { getCurrentMonthKey } from "@shared/lib/date"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { COPY } from "@shared/constants/copy"
import { ActionChip, Button, Icon, InputField, uiColors, uiSpacing } from "@shared/ui"
import { onlyDigits } from "@shared/lib/validation"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"
import { getHomeAccounts, getPaymentSummary } from "../model/selectors"
import type { GroupAccount } from "../model/types"

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
    showToast(source === "remote" ? feedbackPresets.refreshSuccess : feedbackPresets.refreshDemo)
  }

  const listHeader = (
    <View style={styles.listHeaderWrap}>
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

      <View style={styles.searchStack}>
        <InputField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="모임명, 은행명, 계좌번호 검색"
          autoCapitalize="none"
          accessibilityLabel="모임통장 검색"
        />
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
      ) : null}
    </View>
  )

  const listEmpty = !isBootstrapping ? (
    hasActiveFilter ? (
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
        title={COPY.account.createEmptyTitle}
        description={COPY.account.createEmptyDescription}
        actionLabel="모임통장 만들기"
        onAction={() => navigation.navigate(ROUTES.AccountCreate)}
      />
    )
  ) : null

  const listFooter = !isBootstrapping ? (
    <Button
      style={styles.addCard}
      variant="secondary"
      label={COPY.account.createButtonLabel}
      onPress={() => navigation.navigate(ROUTES.AccountCreate)}
    />
  ) : null

  return (
    <View style={styles.screen}>
      <FlatList<GroupAccount>
        style={isWide ? styles.flatListWide : undefined}
        contentContainerStyle={styles.content}
        data={isBootstrapping ? [] : visibleAccounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item: account }) => (
          <AccountSummaryCard
            account={account}
            currentMonth={currentMonth}
            maskAmounts={maskAmounts}
            onPress={() => {
              selectAccount(account.id)
              navigation.navigate(ROUTES.AccountDetail, { accountId: account.id })
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        ListFooterComponentStyle={styles.listFooterStyle}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingAccounts}
            onRefresh={() => void handleRefresh()}
            tintColor={uiColors.primary}
          />
        }
      />
    </View>
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
  flatListWide: {
    maxWidth: 920,
    alignSelf: "center",
    width: "100%",
  },
  listHeaderWrap: {
    gap: 14,
    marginBottom: 14,
  },
  itemSeparator: {
    height: 14,
  },
  listFooterStyle: {
    marginTop: 14,
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
