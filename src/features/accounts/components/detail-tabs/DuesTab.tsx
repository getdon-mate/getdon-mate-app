import { Pressable, StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { ActionChip, Icon } from "@shared/ui"
import { availableMonths } from "../../model/fixtures"
import { formatDate, formatMonth } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import { getLatestReminderForMember, getPaymentSummary } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionHeader } from "../SectionHeader"
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
  const { toggleDues, sendPaymentReminder, sendTransferRequest } = useApp()
  const { showToast } = useFeedback()

  const monthIndex = availableMonths.indexOf(selectedMonth)
  const { dues: currentDues, paid, unpaid, exempt, progress } = getPaymentSummary(account, selectedMonth)
  const unpaidRecords = currentDues.filter((record) => record.status === "unpaid")

  async function handleSendReminder(memberId: string, memberName: string, type: "payment-reminder" | "transfer-request") {
    if (type === "payment-reminder") {
      await sendPaymentReminder(account.id, memberId, selectedMonth)
      showToast({ tone: "success", title: "납부 안내 전송", message: `${memberName}님께 부드럽게 안내를 보냈습니다.` })
      return
    }

    await sendTransferRequest(account.id, memberId, selectedMonth)
    showToast({ tone: "success", title: "송금 요청 전송", message: `${memberName}님께 바로 송금할 수 있도록 요청을 보냈습니다.` })
  }

  async function handleBulkReminder(type: "payment-reminder" | "transfer-request") {
    if (unpaidRecords.length === 0) return

    if (type === "payment-reminder") {
      await Promise.all(unpaidRecords.map((record) => sendPaymentReminder(account.id, record.memberId, selectedMonth)))
      showToast({
        tone: "success",
        title: "전체 안내 전송",
        message: `미납 멤버 ${unpaidRecords.length}명에게 납부 안내를 보냈습니다.`,
      })
      return
    }

    await Promise.all(unpaidRecords.map((record) => sendTransferRequest(account.id, record.memberId, selectedMonth)))
    showToast({
      tone: "success",
      title: "전체 송금 요청",
      message: `미납 멤버 ${unpaidRecords.length}명에게 송금 요청을 보냈습니다.`,
    })
  }

  return (
    <View style={styles.stack}>
      <SectionCard>
        <View style={styles.rowBetween}>
          <Pressable
            disabled={monthIndex >= availableMonths.length - 1}
            onPress={() => onSelectMonth(availableMonths[monthIndex + 1])}
            style={styles.arrowButton}
            accessibilityRole="button"
            accessibilityLabel="이전 달 보기"
          >
            <Icon name="chevronLeft" size={15} color="#334155" />
          </Pressable>
          <Text style={styles.sectionTitle}>{formatMonth(selectedMonth)}</Text>
          <Pressable
            disabled={monthIndex <= 0}
            onPress={() => onSelectMonth(availableMonths[monthIndex - 1])}
            style={styles.arrowButton}
            accessibilityRole="button"
            accessibilityLabel="다음 달 보기"
          >
            <Icon name="chevronRight" size={15} color="#334155" />
          </Pressable>
        </View>
        <View style={styles.monthChipRow}>
          {availableMonths.map((month) => (
            <ActionChip
              key={month}
              label={`${Number(month.slice(-2))}월`}
              active={month === selectedMonth}
              onPress={() => onSelectMonth(month)}
            />
          ))}
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
        {unpaidRecords.length > 0 ? (
          <View style={styles.bulkActionRow}>
            <ActionChip label="미납 전체 안내" onPress={() => void handleBulkReminder("payment-reminder")} />
            <ActionChip label="미납 전체 요청" onPress={() => void handleBulkReminder("transfer-request")} />
          </View>
        ) : null}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="멤버별 납부 현황" />
        {currentDues.length > 0 ? (
          <View style={styles.stackCompact}>
            {currentDues.map((record) => {
              const member = getMemberById(account.members, record.memberId)
              const latestReminder = getLatestReminderForMember(account, record.memberId)
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
                      {record.status === "unpaid" && latestReminder ? (
                        <Text style={styles.reminderMeta}>
                          최근 안내 · {formatDate(latestReminder.createdAt.slice(0, 10))} {latestReminder.type === "payment-reminder" ? "납부 안내" : "송금 요청"}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  {record.status !== "exempt" && (
                    <View style={styles.recordActions}>
                      {record.status === "unpaid" ? (
                        <>
                          <ActionChip
                            label="납부 안내"
                            onPress={() => {
                              void handleSendReminder(record.memberId, member.name, "payment-reminder")
                            }}
                          />
                          <ActionChip
                            label="송금 요청"
                            onPress={() => {
                              void handleSendReminder(record.memberId, member.name, "transfer-request")
                            }}
                          />
                        </>
                      ) : null}
                      <ActionChip
                        label={record.status === "unpaid" ? "완납 처리" : "취소"}
                        active={record.status === "unpaid"}
                        onPress={() => {
                          void toggleDues(record.memberId, selectedMonth)
                        }}
                      />
                    </View>
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
  monthChipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
  bulkActionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
  reminderMeta: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "700",
  },
  recordActions: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
})
