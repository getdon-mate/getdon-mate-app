import { Pressable, StyleSheet, Text, View } from "react-native"
import { Icon, uiColors } from "@shared/ui"
import type { AppUser } from "../model/types"

export function UserHeaderCard({
  user,
  initials,
  unreadNotificationCount,
  onOpenNotifications,
  onOpenMyPage,
  onOpenAppSettings,
}: {
  user: AppUser | null
  initials: string
  unreadNotificationCount?: number
  onOpenNotifications: () => void
  onOpenMyPage: () => void
  onOpenAppSettings: () => void
}) {
  return (
    <View style={styles.headerCard}>
      <View style={styles.profileBadge}>
        <Text style={styles.profileBadgeText}>{initials}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.headerName}>{user?.name}님의 모임</Text>
        <Text style={styles.headerEmail}>함께하는 통장을 관리해보세요</Text>
      </View>
      <View style={styles.actionGroup}>
        <Pressable style={styles.iconButton} onPress={onOpenNotifications} accessibilityRole="button" accessibilityLabel="알림 목록 열기">
          <Icon name="bell" size={16} color={uiColors.textStrong} />
          {unreadNotificationCount ? (
            <View style={styles.notificationBadge} testID="notification-badge">
              <Text style={styles.notificationBadgeText}>{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onOpenMyPage} accessibilityRole="button" accessibilityLabel="마이페이지 열기">
          <Icon name="user" size={16} color={uiColors.textStrong} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onOpenAppSettings} accessibilityRole="button" accessibilityLabel="앱 설정 열기">
          <Icon name="settings" size={16} color={uiColors.textStrong} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: uiColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: uiColors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: uiColors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    color: uiColors.text,
    fontWeight: "700",
    fontSize: 19,
  },
  headerEmail: {
    color: uiColors.textMuted,
    fontSize: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.surfaceMuted,
    position: "relative",
  },
  notificationBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primary,
    position: "absolute",
    top: -3,
    right: -2,
  },
  notificationBadgeText: {
    color: uiColors.surface,
    fontSize: 10,
    fontWeight: "700",
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})
