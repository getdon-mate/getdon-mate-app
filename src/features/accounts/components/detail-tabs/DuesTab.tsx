import { Pressable, StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { availableMonths, formatDate, formatMonth, getMemberById } from "../../model/mock-data"
import { getPaymentSummary } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
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

        <View style={styles.summaryPillRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>완납</Text>
            <Text style={styles.summaryPillValue}>{paid}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>미납</Text>
            <Text style={styles.summaryPillValue}>{unpaid}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>면제</Text>
            <Text style={styles.summaryPillValue}>{exempt}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>멤버별 납부 현황</Text>
        {currentDues.length > 0 ? (
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
                      style={[
                        styles.smallOutlineButton,
                        record.status === "unpaid" ? styles.smallOutlineButtonPrimary : styles.smallOutlineButtonMuted,
                      ]}
                      onPress={() => {
                        void toggleDues(record.memberId, selectedMonth)
                      }}
                    >
                      <Text
                        style={[
                          styles.smallOutlineButtonText,
                          record.status === "unpaid" ? styles.smallOutlineButtonTextPrimary : styles.smallOutlineButtonTextMuted,
                        ]}
                      >
                        {record.status === "unpaid" ? "완납 처리" : "취소"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )
            })}
          </View>
        ) : (
          <EmptyStateCard
            title="이 달의 회비 기록이 없습니다."
            description="월을 변경하거나 멤버 회비를 등록해 진행률을 확인해보세요."
          />
        )}
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
  summaryPillRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 2,
    alignItems: "center",
  },
  summaryPillLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
  },
  summaryPillValue: {
    color: "#111827",
    fontSize: 16,
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
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  smallOutlineButtonPrimary: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },
  smallOutlineButtonMuted: {
    borderColor: "#d7dce5",
    backgroundColor: "#f9fafb",
  },
  smallOutlineButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  smallOutlineButtonTextPrimary: {
    color: "#2563eb",
  },
  smallOutlineButtonTextMuted: {
    color: "#4b5563",
  },
})
