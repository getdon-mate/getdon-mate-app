import { memo, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Badge, Icon, uiColors } from "@shared/ui"
import { formatMonth } from "@shared/lib/format"
import type { DuesRecord, Member } from "../model/types"

type MenuAction = {
  label: string
  icon: "edit" | "user" | "megaphone" | "transfer" | "trash"
  tone?: "default" | "danger"
  disabled?: boolean
  onPress: () => void
}

export const MemberRow = memo(function MemberRow({
  member,
  rate,
  duesRecords,
  onEdit,
  onDelegateOwner,
  delegatePending,
  onDelete,
  reminderActions,
  reminderNote,
  roleNote,
}: {
  member: Member
  rate: number
  duesRecords: DuesRecord[]
  onEdit?: () => void
  onDelegateOwner?: () => void
  delegatePending?: boolean
  onDelete?: () => void
  reminderActions?: { label: string; icon: "megaphone" | "transfer"; onPress: () => void }[]
  reminderNote?: string
  roleNote?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const history = duesRecords
    .filter((record) => record.memberId === member.id)
    .slice(0, 3)

  const actionItems = useMemo<MenuAction[]>(() => {
    const items: MenuAction[] = []

    if (onEdit) {
      items.push({
        label: "수정",
        icon: "edit",
        onPress: onEdit,
      })
    }

    if (onDelegateOwner) {
      items.push({
        label: delegatePending ? "총무 위임 중..." : "총무 위임",
        icon: "user",
        disabled: delegatePending,
        onPress: onDelegateOwner,
      })
    }

    for (const action of reminderActions ?? []) {
      items.push({
        label: action.label,
        icon: action.icon,
        onPress: action.onPress,
      })
    }

    if (member.role !== "총무" && onDelete) {
      items.push({
        label: "삭제",
        icon: "trash",
        tone: "danger",
        onPress: onDelete,
      })
    }

    return items
  }, [delegatePending, member.role, onDelegateOwner, onDelete, onEdit, reminderActions])

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.memberIdentity}>
          <Text style={[styles.avatar, { backgroundColor: member.color }]}>{member.initials}</Text>
          <View style={styles.memberIdentityText}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{member.name}</Text>
              {member.role === "총무" ? <Badge label="현재 총무" tone="primary" /> : null}
              {rate < 100 ? <Badge label="미납 주의" tone="danger" /> : null}
            </View>
            <Text style={styles.memberMeta}>{member.role} · 납부율 {rate}%</Text>
          </View>
        </View>
        {actionItems.length > 0 ? (
          <View style={styles.menuWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="멤버 메뉴 열기"
              onPress={() => setMenuOpen((prev) => !prev)}
              style={[styles.menuButton, menuOpen && styles.menuButtonActive]}
            >
              <Icon name="ellipsis" size={16} color={uiColors.textStrong} />
            </Pressable>
            {menuOpen ? (
              <View style={styles.menuPanel}>
                {actionItems.map((action, index) => (
                  <Pressable
                    key={`${member.id}-${action.label}`}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    disabled={action.disabled}
                    onPress={() => {
                      setMenuOpen(false)
                      action.onPress()
                    }}
                    style={[
                      styles.menuItem,
                      index > 0 && styles.menuItemWithDivider,
                      action.disabled && styles.menuItemDisabled,
                    ]}
                  >
                    <Icon
                      name={action.icon}
                      size={15}
                      color={action.tone === "danger" ? uiColors.danger : uiColors.textStrong}
                    />
                    <Text style={[styles.menuText, action.tone === "danger" && styles.menuTextDanger]}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      {history.map((record) => (
        <Text key={`${member.id}-${record.month}`} style={styles.memberMeta}>
          {formatMonth(record.month)} · {record.status === "paid" ? "완납" : record.status === "unpaid" ? "미납" : "면제"}
        </Text>
      ))}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(6, rate)}%` }]} />
      </View>
      {roleNote ? <Text style={styles.roleNote}>{roleNote}</Text> : null}
      {reminderNote ? <Text style={styles.reminderNote}>{reminderNote}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    backgroundColor: uiColors.surfaceMuted,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  memberIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  memberIdentityText: {
    gap: 2,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: uiColors.surface,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 8,
  },
  memberName: {
    color: uiColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  memberMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
  },
  menuWrap: {
    position: "relative",
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonActive: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  menuPanel: {
    position: "absolute",
    top: 40,
    right: 0,
    minWidth: 152,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    overflow: "hidden",
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemWithDivider: {
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuText: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  menuTextDanger: {
    color: uiColors.danger,
  },
  reminderNote: {
    color: uiColors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  roleNote: {
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: uiColors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: uiColors.primary,
  },
})
