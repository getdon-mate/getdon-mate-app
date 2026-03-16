import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useAppRuntime } from "@core/providers/AppProvider"
import { EmptyStateCard } from "@features/accounts/components/EmptyStateCard"
import type { RootStackParamList } from "@core/navigation/types"
import { Card, Icon, PageHeader, RadioButton, uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { getNotificationCategory, type NotificationItem } from "@shared/lib/notification-state"

type NotificationFilter = "all" | "unread" | "reminder" | "notice"

export function getUnreadActionLabel(width: number) {
  return width < 390 ? "읽음" : "읽음 처리"
}

function filterNotifications(notifications: NotificationItem[], filter: NotificationFilter) {
  if (filter === "all") return notifications
  if (filter === "unread") return notifications.filter((item) => item.unread)
  return notifications.filter((item) => getNotificationCategory(item) === filter)
}

function getCategoryLabel(item: NotificationItem) {
  const category = getNotificationCategory(item)
  return category === "reminder" ? "안내" : category === "notice" ? "공지" : "활동"
}

function getFilterSummary(filter: NotificationFilter) {
  if (filter === "reminder") return "안내만 보고 있어요."
  if (filter === "notice") return "공지 알림만 보고 있어요."
  if (filter === "unread") return "읽지 않은 알림만 보고 있어요."
  return null
}

function getFilterCount(notifications: NotificationItem[], filter: NotificationFilter) {
  if (filter === "all") return notifications.length
  if (filter === "unread") return notifications.filter((item) => item.unread).length
  return notifications.filter((item) => getNotificationCategory(item) === filter).length
}

function FilterChip({
  label,
  count,
  active,
  onPress,
  accessibilityLabel,
  testID,
}: {
  label: string
  count: number
  active: boolean
  onPress: () => void
  accessibilityLabel: string
  testID: string
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
      {count > 0 ? (
        <View style={styles.filterCountBadge} testID={testID}>
          <Text style={styles.filterCountBadgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

export function NotificationListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { width } = useWindowDimensions()
  const compact = width < 420
  const narrow = width < 390
  const unreadActionLabel = getUnreadActionLabel(width)
  const {
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    clearNotifications,
    restoreNotifications,
    markNotificationRead,
  } = useAppRuntime()
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const [menuOpen, setMenuOpen] = useState(false)
  const filteredNotifications = useMemo(() => filterNotifications(notifications, filter), [filter, notifications])
  const filterSummary = getFilterSummary(filter)
  const hasNotifications = notifications.length > 0
  const isFilteredEmpty = hasNotifications && filteredNotifications.length === 0

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
            <Icon name="chevronLeft" size={20} color={uiColors.text} />
          </Pressable>
          <View style={styles.headerMenuWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="알림 메뉴 열기"
              onPress={() => setMenuOpen((prev) => !prev)}
              style={[styles.headerMenuButton, menuOpen && styles.headerMenuButtonActive]}
            >
              <Icon name="ellipsis" size={18} color={uiColors.textStrong} />
            </Pressable>
            {menuOpen ? (
              <View style={styles.headerMenuPanel}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={narrow ? "읽음" : "모두 읽음"}
                  disabled={unreadNotificationCount === 0}
                  onPress={() => {
                    setMenuOpen(false)
                    void markAllNotificationsRead()
                  }}
                  style={[styles.headerMenuItem, unreadNotificationCount === 0 && styles.headerMenuItemDisabled]}
                >
                  <Text style={styles.headerMenuText}>{narrow ? "읽음" : "모두 읽음"}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="비우기"
                  disabled={!hasNotifications}
                  onPress={() => {
                    setMenuOpen(false)
                    void clearNotifications()
                  }}
                  style={[styles.headerMenuItem, styles.headerMenuItemDivider, !hasNotifications && styles.headerMenuItemDisabled]}
                >
                  <Text style={styles.headerMenuText}>비우기</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.headerCopy}>
          <PageHeader title="알림" subtitle={`새 알림 ${unreadNotificationCount}개`} />
        </View>
        <View style={styles.filterRow}>
          <FilterChip
            label="전체"
            count={getFilterCount(notifications, "all")}
            active={filter === "all"}
            onPress={() => setFilter("all")}
            accessibilityLabel="알림 필터 전체"
            testID="notification-filter-chip-all-count"
          />
          <FilterChip
            label="읽지 않음"
            count={getFilterCount(notifications, "unread")}
            active={filter === "unread"}
            onPress={() => setFilter("unread")}
            accessibilityLabel="알림 필터 읽지 않음"
            testID="notification-filter-chip-unread-count"
          />
          <FilterChip
            label="안내"
            count={getFilterCount(notifications, "reminder")}
            active={filter === "reminder"}
            onPress={() => setFilter("reminder")}
            accessibilityLabel="알림 필터 안내"
            testID="notification-filter-chip-reminder-count"
          />
          <FilterChip
            label="공지"
            count={getFilterCount(notifications, "notice")}
            active={filter === "notice"}
            onPress={() => setFilter("notice")}
            accessibilityLabel="알림 필터 공지"
            testID="notification-filter-chip-notice-count"
          />
        </View>
        {filterSummary ? <Text style={styles.filterSummary}>{filterSummary}</Text> : null}
      </View>

      {filteredNotifications.length === 0 ? (
        <EmptyStateCard
          title={isFilteredEmpty ? "맞는 알림이 없습니다." : "표시할 알림이 없습니다."}
          description={isFilteredEmpty ? "필터를 풀고 전체 알림으로 돌아가세요." : "샘플 알림을 다시 불러올 수 있습니다."}
          actionLabel={isFilteredEmpty ? "전체 보기" : "샘플 알림 복원"}
          onAction={isFilteredEmpty ? () => setFilter("all") : () => void restoreNotifications()}
          secondaryActionLabel={isFilteredEmpty ? "샘플 알림 복원" : undefined}
          onSecondaryAction={isFilteredEmpty ? () => void restoreNotifications() : undefined}
        />
      ) : (
        <View style={styles.list}>
          {filteredNotifications.map((item) => (
            <Card key={item.id} style={[styles.noticeCard, compact && styles.noticeCardCompact, item.unread && styles.noticeCardUnread]}>
              <View style={styles.noticeTopRow}>
                <View style={styles.noticeTitleWrap}>
                  <Text style={styles.noticeCategory}>{getCategoryLabel(item)}</Text>
                  <Text style={styles.noticeTitle}>{item.title}</Text>
                </View>
                <View style={styles.noticeStatusSlot}>
                  <RadioButton
                    checked={!item.unread}
                    disabled={!item.unread}
                    onPress={item.unread ? () => void markNotificationRead(item.id) : undefined}
                    accessibilityLabel={`${item.title} ${item.unread ? unreadActionLabel : "읽음 완료"}`}
                    style={styles.readControl}
                  />
                </View>
              </View>
              <Text style={styles.noticeBody}>{item.body}</Text>
              <View style={styles.noticeFooter}>
                <Text style={styles.noticeTime}>{item.time}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  content: {
    padding: uiSpacing.lg,
    gap: uiSpacing.lg,
  },
  topRow: {
    gap: uiSpacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.md,
    position: "relative",
    zIndex: 20,
  },
  headerMenuWrap: {
    position: "relative",
    alignItems: "flex-end",
    zIndex: 30,
  },
  headerMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  headerMenuButtonActive: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  headerMenuPanel: {
    position: "absolute",
    top: 46,
    right: 0,
    minWidth: 124,
    borderRadius: uiRadius.xl,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    overflow: "hidden",
    zIndex: 10,
    elevation: 4,
  },
  headerMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerMenuItemDivider: {
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  headerMenuItemDisabled: {
    opacity: 0.45,
  },
  headerMenuText: {
    fontSize: 13,
    fontWeight: "700",
    color: uiColors.textStrong,
  },
  headerCopy: {
    gap: 6,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: uiRadius.full,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: uiColors.primarySoft,
    borderColor: uiColors.primaryBorder,
  },
  filterChipText: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: uiColors.primary,
  },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.danger,
  },
  filterCountBadgeText: {
    color: uiColors.surface,
    fontSize: 10,
    fontWeight: "800",
  },
  filterSummary: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  list: {
    gap: uiSpacing.md,
  },
  noticeCard: {
    gap: 10,
  },
  noticeCardCompact: {
    gap: 8,
  },
  noticeCardUnread: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  noticeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: uiSpacing.sm,
  },
  noticeTitleWrap: {
    flex: 1,
    gap: 4,
  },
  noticeStatusSlot: {
    width: 28,
    alignItems: "flex-end",
  },
  noticeCategory: {
    alignSelf: "flex-start",
    borderRadius: uiRadius.full,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    color: uiColors.primary,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: uiColors.text,
  },
  noticeTime: {
    fontSize: 12,
    color: uiColors.textMuted,
    fontWeight: "600",
  },
  noticeBody: {
    fontSize: 12,
    lineHeight: 18,
    color: uiColors.textMuted,
  },
  noticeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 2,
  },
  readControl: {
    marginLeft: "auto",
  },
})
