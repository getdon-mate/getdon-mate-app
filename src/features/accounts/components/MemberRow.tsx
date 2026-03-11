import { StyleSheet, Text, View } from "react-native"
import { formatMonth } from "../model/mock-data"
import type { DuesRecord, Member } from "../model/types"

export function MemberRow({
  member,
  rate,
  duesRecords,
}: {
  member: Member
  rate: number
  duesRecords: DuesRecord[]
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
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberMeta}>{member.role} · 납부율 {rate}%</Text>
          </View>
        </View>
      </View>
      {history.map((record) => (
        <Text key={`${member.id}-${record.month}`} style={styles.memberMeta}>
          {formatMonth(record.month)} · {record.status === "paid" ? "완납" : record.status === "unpaid" ? "미납" : "면제"}
        </Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    gap: 6,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: "#ffffff",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 8,
  },
  memberName: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  memberMeta: {
    color: "#64748b",
    fontSize: 12,
  },
})
