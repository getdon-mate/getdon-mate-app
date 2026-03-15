import { memo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Badge, Button, uiColors } from "@shared/ui"
import { formatMonth } from "@shared/lib/format"
import type { DuesRecord, Member } from "../model/types"

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
  reminderActions?: { label: string; onPress: () => void }[]
  reminderNote?: string
  roleNote?: string
}) {
  const history = duesRecords
    .filter((record) => record.memberId === member.id)
    .slice(0, 3)

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.memberIdentity}>
          <Text style={[styles.avatar, { backgroundColor: member.color }]}>{member.initials}</Text>
          <View>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{member.name}</Text>
              {member.role === "총무" ? <Badge label="현재 총무" tone="primary" /> : null}
              {rate < 100 ? <Badge label="미납 주의" tone="danger" /> : null}
            </View>
            <Text style={styles.memberMeta}>{member.role} · 납부율 {rate}%</Text>
          </View>
        </View>
        {onEdit || onDelegateOwner || onDelete ? (
          <View style={styles.actions}>
            {onEdit ? <Button label="수정" variant="ghost" onPress={onEdit} style={styles.actionButton} /> : null}
            {onDelegateOwner ? (
              <Button
                label={delegatePending ? "위임 중..." : "총무 위임"}
                variant="secondary"
                onPress={onDelegateOwner}
                style={styles.actionButtonWide}
                disabled={delegatePending}
              />
            ) : null}
            {member.role !== "총무" && onDelete ? <Button label="삭제" variant="danger" onPress={onDelete} style={styles.actionButton} /> : null}
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
      {reminderActions && reminderActions.length > 0 ? (
        <View style={styles.reminderActions}>
          {reminderActions.map((action) => (
            <Button key={action.label} label={action.label} variant="ghost" onPress={action.onPress} style={styles.reminderButton} />
          ))}
        </View>
      ) : null}
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  memberIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    minWidth: 64,
    paddingVertical: 8,
  },
  actionButtonWide: {
    minWidth: 92,
    paddingVertical: 8,
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
  reminderActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  reminderButton: {
    minWidth: 88,
    paddingVertical: 8,
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
