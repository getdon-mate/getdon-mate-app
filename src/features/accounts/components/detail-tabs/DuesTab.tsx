import { Pressable, StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { availableMonths, formatDate, formatMonth, getMemberById } from "../../model/mock-data"
import { getPaymentSummary } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { SectionCard } from "../SectionCard"

export function DuesTab({
  account,
  selectedMonth,
  onSelectMonth,
}: {
  account: GroupAccount
  selectedMonth: string
  onSelectMonth: (month: string) => void
}) {
  const { toggleDues } = useApp()

  const monthIndex = availableMonths.indexOf(selectedMonth)
  const { dues: currentDues, paid, unpaid, exempt, progress } = getPaymentSummary(account, selectedMonth)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <View style={styles.rowBetween}>
          <Pressable
            disabled={monthIndex >= availableMonths.length - 1}
            onPress={() => onSelectMonth(availableMonths[monthIndex + 1])}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowButtonText}>◀</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>{formatMonth(selectedMonth)}</Text>
          <Pressable
            disabled={monthIndex <= 0}
            onPress={() => onSelectMonth(availableMonths[monthIndex - 1])}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowButtonText}>▶</Text>
          </Pressable>
        </View>

        <Text style={styles.metricText}>완납 {paid}명 · 미납 {unpaid}명 · 면제 {exempt}명</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>멤버별 납부 현황</Text>
        <View style={styles.stackCompact}>
          {currentDues.map((record) => {
            const member = getMemberById(account.members, record.memberId)
            if (!member) return null
            return (
              <View key={`${record.memberId}-${record.month}`} style={styles.memberRow}>
                <View style={styles.memberIdentity}>
                  <Text style={[styles.avatar, { backgroundColor: member.color }]}>{member.initials}</Text>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberMeta}>
                      {record.status === "paid" && record.paidDate ? `${formatDate(record.paidDate)} 납부` : record.status === "unpaid" ? "미납" : "면제"}
                    </Text>
                  </View>
                </View>
                {record.status !== "exempt" && (
                  <Pressable
                    style={styles.smallOutlineButton}
                    onPress={() => toggleDues(record.memberId, selectedMonth)}
                  >
                    <Text style={styles.smallOutlineButtonText}>{record.status === "unpaid" ? "완납 처리" : "취소"}</Text>
                  </Pressable>
                )}
              </View>
            )
          })}
        </View>
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  metricText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 4,
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
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  memberMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  smallOutlineButton: {
    borderWidth: 1,
    borderColor: "#d7dce5",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "#f9fafb",
  },
  smallOutlineButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
})
