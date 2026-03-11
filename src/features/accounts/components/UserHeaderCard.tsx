import { Pressable, StyleSheet, Text, View } from "react-native"
import type { AppUser } from "../model/types"

export function UserHeaderCard({
  user,
  initials,
  onWithdraw,
  onLogout,
}: {
  user: AppUser | null
  initials: string
  onWithdraw: () => void
  onLogout: () => void
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
      <View style={styles.headerActions}>
        <Pressable style={styles.iconButton} onPress={onLogout}>
          <Text style={styles.iconButtonText}>로그아웃</Text>
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onWithdraw}>
          <Text style={[styles.iconButtonText, styles.iconButtonDangerText]}>탈퇴</Text>
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
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  iconButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  iconButtonDangerText: {
    color: "#dc2626",
  },
})
