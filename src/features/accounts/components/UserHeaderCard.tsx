import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { Icon, uiColors } from "@shared/ui"
import type { AppUser } from "../model/types"

export function UserHeaderCard({
  user,
  initials,
  unreadNotificationCount,
  maskAmounts,
  onToggleMaskAmounts,
  onOpenNotifications,
  onOpenMyPage,
  onOpenAppSettings,
}: {
  user: AppUser | null
  initials: string
  unreadNotificationCount?: number
  maskAmounts: boolean
  onToggleMaskAmounts: () => void
  onOpenNotifications: () => void
  onOpenMyPage: () => void
  onOpenAppSettings: () => void
}) {
  const { width } = useWindowDimensions()
  const compact = width < 390

  return (
    <View style={[styles.headerCard, compact && styles.headerCardCompact]}>
      <View style={[styles.profileBadge, compact && styles.profileBadgeCompact]}>
        <Text style={[styles.profileBadgeText, compact && styles.profileBadgeTextCompact]}>{initials}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={[styles.headerName, compact && styles.headerNameCompact]}>{user?.name ?? "게스트"}</Text>
        <Text style={styles.headerEmail}>내 모임통장</Text>
      </View>
      <View style={[styles.actionGroup, compact && styles.actionGroupCompact]}>
        <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={onToggleMaskAmounts} accessibilityRole="button" accessibilityLabel="금액 표시 전환">
          <Icon name={maskAmounts ? "eyeOff" : "eye"} size={16} color={uiColors.textStrong} />
        </Pressable>
        <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={onOpenNotifications} accessibilityRole="button" accessibilityLabel="알림 목록 열기">
          <Icon name="bell" size={16} color={uiColors.textStrong} />
          {unreadNotificationCount ? (
            <View style={styles.notificationBadge} testID="notification-badge">
              <Text style={styles.notificationBadgeText}>{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={onOpenMyPage} accessibilityRole="button" accessibilityLabel="마이페이지 열기">
          <Icon name="user" size={16} color={uiColors.textStrong} />
        </Pressable>
        <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={onOpenAppSettings} accessibilityRole="button" accessibilityLabel="앱 설정 열기">
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
  headerCardCompact: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: uiColors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileBadgeText: {
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  profileBadgeTextCompact: {
    fontSize: 13,
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
  headerNameCompact: {
    fontSize: 17,
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
  iconButtonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  actionGroupCompact: {
    gap: 6,
  },
})
