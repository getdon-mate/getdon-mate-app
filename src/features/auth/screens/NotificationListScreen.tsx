import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useAppRuntime } from "@core/providers/AppProvider"
import { EmptyStateCard } from "@features/accounts/components/EmptyStateCard"
import type { RootStackParamList } from "@core/navigation/types"
import { ActionChip, Button, Card, Icon, PageHeader, uiColors, uiRadius, uiSpacing } from "@shared/ui"
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
  const filteredNotifications = useMemo(() => filterNotifications(notifications, filter), [filter, notifications])
  const filterSummary = getFilterSummary(filter)
  const hasNotifications = notifications.length > 0
  const isFilteredEmpty = hasNotifications && filteredNotifications.length === 0
  const readNotificationCount = notifications.length - unreadNotificationCount

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
            <Icon name="chevronLeft" size={20} color={uiColors.text} />
          </Pressable>
          <View style={[styles.headerActions, narrow && styles.headerActionsCompact]}>
            <Button
              label={narrow ? "읽음" : "모두 읽음"}
              variant="ghost"
              onPress={() => void markAllNotificationsRead()}
              style={[styles.headerActionButton, narrow && styles.headerActionButtonCompact]}
              disabled={unreadNotificationCount === 0}
            />
            <Button
              label="비우기"
              variant="ghost"
              onPress={() => void clearNotifications()}
              style={[styles.headerActionButton, narrow && styles.headerActionButtonCompact]}
              disabled={!hasNotifications}
            />
          </View>
        </View>
        <View style={styles.headerCopy}>
          <PageHeader title="알림" subtitle={`새 알림 ${unreadNotificationCount}개`} />
          <Text style={styles.headerHint}>중요한 안내만 빠르게 확인하세요.</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>전체</Text>
            <Text style={styles.summaryValue}>{notifications.length}건</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>읽지 않음</Text>
            <Text style={styles.summaryValue}>{unreadNotificationCount}건</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>읽음 완료</Text>
            <Text style={styles.summaryValue}>{readNotificationCount}건</Text>
          </View>
        </View>
        <View style={styles.filterRow}>
          <ActionChip label="전체" active={filter === "all"} onPress={() => setFilter("all")} accessibilityLabel="알림 필터 전체" />
          <ActionChip label="읽지 않음" active={filter === "unread"} onPress={() => setFilter("unread")} accessibilityLabel="알림 필터 읽지 않음" />
          <ActionChip label="안내" active={filter === "reminder"} onPress={() => setFilter("reminder")} accessibilityLabel="알림 필터 안내" />
          <ActionChip label="공지" active={filter === "notice"} onPress={() => setFilter("notice")} accessibilityLabel="알림 필터 공지" />
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
                <Text style={styles.noticeTime}>{item.time}</Text>
              </View>
              <Text style={styles.noticeBody}>{item.body}</Text>
              <View style={styles.noticeFooter}>
                {item.unread ? <View style={styles.unreadDot} /> : <Text style={styles.readLabel}>읽음 완료</Text>}
                {item.unread ? (
                  <Button
                    label={unreadActionLabel}
                    variant="secondary"
                    onPress={() => void markNotificationRead(item.id)}
                    accessibilityLabel={`${item.title} ${unreadActionLabel}`}
                    style={[styles.readButton, compact && styles.readButtonCompact, narrow && styles.readButtonNarrow]}
                  />
                ) : null}
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
  },
  headerActions: {
    flexDirection: "row",
    gap: uiSpacing.sm,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  headerActionsCompact: {
    gap: 6,
  },
  headerActionButton: {
    minWidth: 86,
    minHeight: 38,
  },
  headerActionButtonCompact: {
    minWidth: 72,
    minHeight: 34,
  },
  headerCopy: {
    gap: 6,
  },
  headerHint: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 3,
  },
  summaryLabel: {
    color: uiColors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  summaryValue: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "800",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
    gap: uiSpacing.sm,
  },
  noticeCardCompact: {
    gap: 10,
  },
  noticeCardUnread: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  noticeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: uiSpacing.md,
  },
  noticeTitleWrap: {
    flex: 1,
    gap: 6,
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
    fontSize: 15,
    fontWeight: "700",
    color: uiColors.text,
  },
  noticeTime: {
    fontSize: 12,
    color: uiColors.textMuted,
    fontWeight: "600",
  },
  noticeBody: {
    fontSize: 13,
    lineHeight: 19,
    color: uiColors.textMuted,
  },
  noticeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.md,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: uiColors.primary,
  },
  readLabel: {
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  readButton: {
    minHeight: 36,
    borderRadius: uiRadius.full,
  },
  readButtonCompact: {
    minWidth: 78,
    minHeight: 34,
  },
  readButtonNarrow: {
    minWidth: 62,
    paddingHorizontal: 10,
  },
})
