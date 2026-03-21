import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useAppAccounts } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateAll, validateIsoDate, validatePositiveNumber } from "@shared/lib/validation"
import { ActionChip, Button, InputField, NumericInputField, RadioButton, uiColors, uiRadius } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import type { GroupAccount } from "../../model/types"

type RecordFilter = "all" | "paid" | "unpaid"

export function OneTimeDuesPanel({ account }: { account: GroupAccount }) {
  const { createOneTimeDues, updateOneTimeDues, closeOneTimeDues, deleteOneTimeDues, toggleOneTimeDuesRecord } = useAppAccounts()
  const { showError, showToast, confirmDanger } = useFeedback()

  const [title, setTitle] = useState("")
  const [duesAmount, setDuesAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [editingDuesId, setEditingDuesId] = useState<string | null>(null)
  const [recordFilter, setRecordFilter] = useState<RecordFilter>("all")

  useEffect(() => {
    resetForm()
    setRecordFilter("all")
  }, [account.id])

  function resetForm() {
    setEditingDuesId(null)
    setTitle("")
    setDuesAmount("")
    setDueDate("")
  }

  async function handleSubmit() {
    const parsedAmount = Number(duesAmount)
    const validationError = validateAll(
      requireText(title, "회비 명목을 입력해주세요."),
      validatePositiveNumber(duesAmount, "금액을 올바르게 입력해주세요."),
      validateIsoDate(dueDate),
    )
    if (validationError) {
      showError(validationError, feedbackPresets.validationError.title)
      return
    }

    if (editingDuesId) {
      await updateOneTimeDues(account.id, editingDuesId, { title: title.trim(), amount: parsedAmount, dueDate: dueDate.trim() })
      showToast({ tone: "success", title: "수정 완료", message: "1회성 회비를 수정했습니다." })
      resetForm()
      return
    }

    await createOneTimeDues(account.id, { title: title.trim(), amount: parsedAmount, dueDate: dueDate.trim() })
    resetForm()
    showToast({ tone: "success", title: "생성 완료", message: "1회성 회비를 생성했습니다." })
  }

  function handleEdit(duesId: string) {
    const target = account.oneTimeDues.find((dues) => dues.id === duesId)
    if (!target) return
    setEditingDuesId(target.id)
    setTitle(target.title)
    setDuesAmount(String(target.amount))
    setDueDate(target.dueDate)
  }

  async function handleToggleClose(duesId: string, closed: boolean) {
    await closeOneTimeDues(account.id, duesId, closed)
    showToast({
      tone: "success",
      title: closed ? "마감 완료" : "마감 해제",
      message: closed ? "1회성 회비를 종료 상태로 전환했습니다." : "1회성 회비를 다시 진행 상태로 전환했습니다.",
    })
  }

  async function handleDelete(duesId: string) {
    const confirmed = await confirmDanger({ title: "1회성 회비 삭제", message: "회비 항목과 납부 상태가 함께 삭제됩니다.", confirmLabel: "삭제" })
    if (!confirmed) return
    await deleteOneTimeDues(account.id, duesId)
    if (editingDuesId === duesId) resetForm()
    showToast({ tone: "success", title: "삭제 완료", message: "1회성 회비를 삭제했습니다." })
  }

  return (
    <View style={styles.panelCard}>
      <Text style={styles.panelTitle}>{editingDuesId ? "1회성 회비 수정" : "1회성 회비"}</Text>
      <View style={styles.formStack}>
        <InputField value={title} onChangeText={setTitle} label="회비 명목" placeholder="회비 명목" />
        <NumericInputField value={duesAmount} onChangeText={setDuesAmount} label="금액" placeholder="금액" />
        <InputField value={dueDate} onChangeText={setDueDate} label="마감일" placeholder="YYYY-MM-DD" />
        <View style={styles.actionRow}>
          {editingDuesId ? <Button label="수정 취소" variant="ghost" onPress={resetForm} style={styles.actionButton} /> : null}
          <Button label={editingDuesId ? "수정 저장" : "생성"} onPress={() => void handleSubmit()} style={styles.actionButton} />
        </View>
      </View>

      <View style={styles.filterRow}>
        <FilterOption label="전체" checked={recordFilter === "all"} onPress={() => setRecordFilter("all")} />
        <FilterOption label="완납" checked={recordFilter === "paid"} onPress={() => setRecordFilter("paid")} />
        <FilterOption label="미납" checked={recordFilter === "unpaid"} onPress={() => setRecordFilter("unpaid")} />
      </View>

      {account.oneTimeDues.length > 0 ? (
        <View style={styles.duesList}>
          {account.oneTimeDues.map((dues) => {
            const filteredRecords = dues.records.filter((record) => {
              if (recordFilter === "all") return true
              return record.status === recordFilter
            })
            return (
              <View key={dues.id} style={styles.duesCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.duesTitle}>{dues.title} · {formatKRW(dues.amount)}</Text>
                  <ActionChip
                    label={dues.status === "closed" ? "종료" : "진행 중"}
                    active={dues.status === "active"}
                    onPress={() => void handleToggleClose(dues.id, dues.status === "active")}
                  />
                </View>
                <Text style={styles.duesMeta}>마감 {dues.dueDate}</Text>
                <View style={styles.filterRow}>
                  <ActionChip label="편집" onPress={() => handleEdit(dues.id)} />
                  <ActionChip
                    label={dues.status === "active" ? "마감" : "재개"}
                    onPress={() => void handleToggleClose(dues.id, dues.status === "active")}
                  />
                  <ActionChip label="삭제" onPress={() => void handleDelete(dues.id)} />
                </View>
                {filteredRecords.length === 0 ? (
                  <Text style={styles.emptyDescription}>선택한 상태의 멤버가 없습니다.</Text>
                ) : (
                  filteredRecords.map((record) => {
                    const member = getMemberById(account.members, record.memberId)
                    if (!member) return null
                    return (
                      <View key={`${dues.id}-${record.memberId}`} style={styles.rowBetween}>
                        <Text style={styles.recordName}>{member.name}</Text>
                        <Pressable
                          onPress={() => {
                            if (dues.status === "closed") return
                            void toggleOneTimeDuesRecord(account.id, dues.id, member.id)
                          }}
                          style={[
                            styles.statusChip,
                            record.status === "paid" ? styles.statusChipPaid : styles.statusChipUnpaid,
                            dues.status === "closed" && styles.statusChipDisabled,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`${member.name} 납부 상태 토글`}
                        >
                          <Text style={[styles.statusChipText, record.status === "paid" ? styles.statusChipTextPaid : styles.statusChipTextUnpaid]}>
                            {record.status === "paid" ? "완납" : "미납"}
                          </Text>
                        </Pressable>
                      </View>
                    )
                  })
                )}
              </View>
            )
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>등록된 1회성 회비가 없습니다.</Text>
          <Text style={styles.emptyDescription}>위에서 새 항목을 추가해보세요.</Text>
        </View>
      )}
    </View>
  )
}

function FilterOption({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.filterOption} onPress={onPress}>
      <RadioButton checked={checked} onPress={onPress} />
      <Text style={[styles.filterLabel, checked && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  panelCard: {
    backgroundColor: uiColors.surface,
    borderRadius: uiRadius.xxl,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: uiColors.textStrong,
  },
  formStack: {
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: uiColors.textMuted,
    fontWeight: "600",
  },
  filterLabelActive: {
    color: uiColors.primary,
  },
  duesList: {
    gap: 10,
  },
  duesCard: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
    padding: 12,
    gap: 8,
    backgroundColor: uiColors.surface,
  },
  duesTitle: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
  duesMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
  },
  recordName: {
    color: uiColors.textMuted,
    fontSize: 13,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  statusChipDisabled: {
    opacity: 0.5,
  },
  statusChipPaid: {
    backgroundColor: uiColors.successSoft,
    borderColor: uiColors.successBorder,
  },
  statusChipUnpaid: {
    backgroundColor: uiColors.dangerSoft,
    borderColor: uiColors.dangerBorder,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusChipTextPaid: {
    color: uiColors.success,
  },
  statusChipTextUnpaid: {
    color: uiColors.danger,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
    backgroundColor: uiColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 4,
  },
  emptyTitle: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyDescription: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
})
