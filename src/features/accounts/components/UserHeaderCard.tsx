import { Pressable, StyleSheet, Text, View } from "react-native"
import { Icon } from "@shared/ui"
import type { AppUser } from "../model/types"

export function UserHeaderCard({
  user,
  initials,
  onOpenNotifications,
  onOpenMyPage,
  onOpenAppSettings,
}: {
  user: AppUser | null
  initials: string
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
          <Icon name="bell" size={16} color="#0f172a" />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onOpenMyPage} accessibilityRole="button" accessibilityLabel="마이페이지 열기">
          <Icon name="user" size={16} color="#0f172a" />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onOpenAppSettings} accessibilityRole="button" accessibilityLabel="앱 설정 열기">
          <Icon name="settings" size={16} color="#0f172a" />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eef1f5",
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
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 19,
  },
  headerEmail: {
    color: "#6b7280",
    fontSize: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})
