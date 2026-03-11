import { Pressable, StyleSheet, Text, View } from "react-native"
import { useApp } from "../../../../core/providers/AppProvider"
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
    gap: 12,
  },
  stackCompact: {
    gap: 8,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
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
  smallOutlineButton: {
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  smallOutlineButtonText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
})
