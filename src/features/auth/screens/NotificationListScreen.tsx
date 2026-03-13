import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { EmptyStateCard } from "@features/accounts/components/EmptyStateCard"
import type { RootStackParamList } from "@core/navigation/types"
import { Button, Card, Icon, PageHeader, uiColors, uiRadius, uiSpacing } from "@shared/ui"

type NotificationItem = {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notice-1",
    title: "회비 마감이 다가오고 있어요",
    body: "이번 달 회비 납부 마감이 3일 남았습니다.",
    time: "방금 전",
    unread: true,
  },
  {
    id: "notice-2",
    title: "생활비 통장에 입금이 반영됐어요",
    body: "김토스님이 50,000원을 채웠습니다.",
    time: "10분 전",
    unread: true,
  },
  {
    id: "notice-3",
    title: "모임 공지가 등록됐어요",
    body: "이번 주 정산 안내를 확인해보세요.",
    time: "어제",
    unread: false,
  },
]

export function NotificationListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [notifications, setNotifications] = useState([...initialNotifications])
  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications])

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
  }

  function handleClearAll() {
    setNotifications([])
  }

  function handleRestore() {
    setNotifications([...initialNotifications])
  }

  function handleRead(id: string) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)))
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
            <Icon name="chevronLeft" size={20} color={uiColors.text} />
          </Pressable>
          <View style={styles.headerActions}>
            <Button label="모두 읽음" variant="ghost" onPress={handleMarkAllRead} style={styles.headerActionButton} />
            <Button label="비우기" variant="ghost" onPress={handleClearAll} style={styles.headerActionButton} />
          </View>
        </View>
        <View style={styles.headerCopy}>
          <PageHeader title="알림" subtitle={`새 알림 ${unreadCount}개`} />
          <Text style={styles.headerHint}>읽음 처리와 목록 정리는 이 화면에서 바로 할 수 있습니다.</Text>
        </View>
      </View>

      {notifications.length === 0 ? (
        <EmptyStateCard
          title="알림이 없습니다."
          description="새 알림이 생기면 이곳에서 바로 확인할 수 있습니다."
          actionLabel="샘플 알림 복원"
          onAction={handleRestore}
        />
      ) : (
        <View style={styles.list}>
          {notifications.map((item) => (
            <Card key={item.id} style={[styles.noticeCard, item.unread && styles.noticeCardUnread]}>
              <View style={styles.noticeTopRow}>
                <Text style={styles.noticeTitle}>{item.title}</Text>
                <Text style={styles.noticeTime}>{item.time}</Text>
              </View>
              <Text style={styles.noticeBody}>{item.body}</Text>
              <View style={styles.noticeFooter}>
                {item.unread ? <View style={styles.unreadDot} /> : <Text style={styles.readLabel}>읽음 완료</Text>}
                {item.unread ? (
                  <Button label="읽음 처리" variant="secondary" onPress={() => handleRead(item.id)} style={styles.readButton} />
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
  },
  headerActionButton: {
    minWidth: 86,
    minHeight: 38,
  },
  headerCopy: {
    gap: 6,
  },
  headerHint: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
  noticeCardUnread: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  noticeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: uiSpacing.md,
  },
  noticeTitle: {
    flex: 1,
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
})
