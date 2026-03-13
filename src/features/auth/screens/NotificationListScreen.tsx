import { useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { Card, Icon, PageHeader, uiColors, uiSpacing } from "@shared/ui"

const mockNotifications = [
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
] as const

export function NotificationListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const unreadCount = useMemo(() => mockNotifications.filter((item) => item.unread).length, [])

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
          <Icon name="chevronLeft" size={20} color={uiColors.text} />
        </Pressable>
        <PageHeader title="알림" subtitle={`새 알림 ${unreadCount}개`} />
      </View>

      <View style={styles.list}>
        {mockNotifications.map((item) => (
          <Card key={item.id} style={[styles.noticeCard, item.unread && styles.noticeCardUnread]}>
            <View style={styles.noticeTopRow}>
              <Text style={styles.noticeTitle}>{item.title}</Text>
              <Text style={styles.noticeTime}>{item.time}</Text>
            </View>
            <Text style={styles.noticeBody}>{item.body}</Text>
            {item.unread ? <View style={styles.unreadDot} /> : null}
          </Card>
        ))}
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
    padding: uiSpacing.lg,
    gap: uiSpacing.lg,
  },
  topRow: {
    gap: uiSpacing.md,
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
    position: "relative",
  },
  noticeCardUnread: {
    borderColor: "#c7d2fe",
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
  unreadDot: {
    position: "absolute",
    top: 18,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
})
