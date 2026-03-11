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
        <Text style={styles.headerName}>{user?.name}님</Text>
        <Text style={styles.headerEmail}>{user?.email}</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable style={styles.ghostButton} onPress={onWithdraw}>
          <Text style={styles.ghostButtonDangerText}>탈퇴</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={onLogout}>
          <Text style={styles.ghostButtonText}>로그아웃</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6e9ef",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e7f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: "#2563eb",
    fontSize: 18,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 16,
  },
  headerEmail: {
    color: "#6b7280",
    fontSize: 13,
  },
  headerActions: {
    gap: 8,
  },
  ghostButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  ghostButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  ghostButtonDangerText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
})
