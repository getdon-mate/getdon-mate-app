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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },
  headerEmail: {
    color: "#64748b",
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  ghostButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
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
