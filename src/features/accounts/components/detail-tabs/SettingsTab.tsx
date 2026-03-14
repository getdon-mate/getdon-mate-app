import { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateDayOfMonth, validateIsoDate, validatePositiveNumber } from "@shared/lib/validation"
import { ActionChip, Button, Icon, InputField, NumericInputField, RadioButton, ToggleSwitch, uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import type { GroupAccount } from "../../model/types"

type RecordFilter = "all" | "paid" | "unpaid"

function getNextTransferDate(day: number) {
  const now = new Date()
  const target = new Date(now)
  target.setDate(Math.min(day, 28))
  if (target.getTime() < now.getTime()) {
    target.setMonth(target.getMonth() + 1)
  }
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`
}

export function SettingsTab({ account }: { account: GroupAccount }) {
  const {
    updateAutoTransfer,
    updateAccount,
    createOneTimeDues,
    updateOneTimeDues,
    closeOneTimeDues,
    deleteOneTimeDues,
    toggleOneTimeDuesRecord,
    deleteAccount,
  } = useApp()
  const { showAlert, showToast, showError, confirmDanger } = useFeedback()
  const [groupName, setGroupName] = useState(account.groupName)
  const [bankName, setBankName] = useState(account.bankName)
  const [accountNumber, setAccountNumber] = useState(account.accountNumber)
  const [monthlyDues, setMonthlyDues] = useState(String(account.monthlyDuesAmount))
  const [accountDueDay, setAccountDueDay] = useState(String(account.dueDay))

  const [enabled, setEnabled] = useState(account.autoTransfer.enabled)
  const [day, setDay] = useState(String(account.autoTransfer.dayOfMonth))
  const [amount, setAmount] = useState(String(account.autoTransfer.amount))
  const [fromAccount, setFromAccount] = useState(account.autoTransfer.fromAccount)

  const [title, setTitle] = useState("")
  const [duesAmount, setDuesAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [editingDuesId, setEditingDuesId] = useState<string | null>(null)

  const [recordFilter, setRecordFilter] = useState<RecordFilter>("all")

  const nextTransferPreview = useMemo(() => {
    const parsedDay = Number(day)
    const parsedAmount = Number(amount)
    if (!enabled || !Number.isFinite(parsedDay) || parsedDay < 1 || parsedDay > 28 || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return null
    }
    return `${getNextTransferDate(parsedDay)}에 ${formatKRW(parsedAmount)} 출금 예정`
  }, [amount, day, enabled])

  function resetOneTimeDuesForm() {
    setEditingDuesId(null)
    setTitle("")
    setDuesAmount("")
    setDueDate("")
  }

  useEffect(() => {
    setGroupName(account.groupName)
    setBankName(account.bankName)
    setAccountNumber(account.accountNumber)
    setMonthlyDues(String(account.monthlyDuesAmount))
    setAccountDueDay(String(account.dueDay))
    setEnabled(account.autoTransfer.enabled)
    setDay(String(account.autoTransfer.dayOfMonth))
    setAmount(String(account.autoTransfer.amount))
    setFromAccount(account.autoTransfer.fromAccount)
    resetOneTimeDuesForm()
    setRecordFilter("all")
  }, [
    account.accountNumber,
    account.autoTransfer.amount,
    account.autoTransfer.dayOfMonth,
    account.autoTransfer.enabled,
    account.autoTransfer.fromAccount,
    account.bankName,
    account.dueDay,
    account.groupName,
    account.id,
    account.monthlyDuesAmount,
  ])

  async function handleSaveAutoTransfer() {
    const parsedDay = Number(day)
    const parsedAmount = Number(amount)

    const dayError = validateDayOfMonth(day)
    if (enabled && dayError) {
      showError(dayError, feedbackPresets.validationError.title)
      return
    }

    const amountError = validatePositiveNumber(amount, "금액을 올바르게 입력해주세요.")
    if (enabled && amountError) {
      showError(amountError, feedbackPresets.validationError.title)
      return
    }

    const fromAccountError = requireText(fromAccount, "출금 계좌를 입력해주세요.")
    if (enabled && fromAccountError) {
      showError(fromAccountError, feedbackPresets.validationError.title)
      return
    }

    await updateAutoTransfer(account.id, {
      enabled,
      dayOfMonth: Number.isFinite(parsedDay) ? parsedDay : account.autoTransfer.dayOfMonth,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : account.autoTransfer.amount,
      fromAccount: fromAccount.trim(),
    })

    showToast({ tone: "success", title: "저장 완료", message: "자동이체 설정을 저장했습니다." })
  }

  async function handleSaveAccountInfo() {
    const validationError =
      requireText(groupName, "모임명을 입력해주세요.") ??
      requireText(bankName, "은행명을 입력해주세요.") ??
      requireText(accountNumber, "계좌번호를 입력해주세요.") ??
      validatePositiveNumber(monthlyDues, "월 회비를 올바르게 입력해주세요.") ??
      validateDayOfMonth(accountDueDay)
    if (validationError) {
      showAlert({ title: "입력 오류", message: validationError, tone: "danger" })
      return
    }

    await updateAccount(account.id, {
      groupName: groupName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      monthlyDuesAmount: Number(monthlyDues),
      dueDay: Number(accountDueDay),
    })

    showToast({ tone: "success", title: "저장 완료", message: "모임통장 기본정보를 수정했습니다." })
  }

  async function handleSubmitOneTimeDues() {
    const parsedAmount = Number(duesAmount)
    const validationError =
      requireText(title, "회비 명목을 입력해주세요.") ??
      validatePositiveNumber(duesAmount, "금액을 올바르게 입력해주세요.") ??
      validateIsoDate(dueDate)

    if (validationError) {
      showError(validationError, feedbackPresets.validationError.title)
      return
    }

    if (editingDuesId) {
      await updateOneTimeDues(account.id, editingDuesId, {
        title: title.trim(),
        amount: parsedAmount,
        dueDate: dueDate.trim(),
      })
      showToast({ tone: "success", title: "수정 완료", message: "1회성 회비를 수정했습니다." })
      resetOneTimeDuesForm()
      return
    }

    await createOneTimeDues(account.id, {
      title: title.trim(),
      amount: parsedAmount,
      dueDate: dueDate.trim(),
    })

    resetOneTimeDuesForm()
    showToast({ tone: "success", title: "생성 완료", message: "1회성 회비를 생성했습니다." })
  }

  function handleEditOneTimeDues(duesId: string) {
    const target = account.oneTimeDues.find((dues) => dues.id === duesId)
    if (!target) return
    setEditingDuesId(target.id)
    setTitle(target.title)
    setDuesAmount(String(target.amount))
    setDueDate(target.dueDate)
  }

  async function handleCloseOneTimeDues(duesId: string, closed: boolean) {
    await closeOneTimeDues(account.id, duesId, closed)
    showToast({
      tone: "success",
      title: closed ? "마감 완료" : "마감 해제",
      message: closed ? "1회성 회비를 종료 상태로 전환했습니다." : "1회성 회비를 다시 진행 상태로 전환했습니다.",
    })
  }

  async function handleDeleteOneTimeDues(duesId: string) {
    const confirmed = await confirmDanger({
      title: "1회성 회비 삭제",
      message: "회비 항목과 납부 상태가 함께 삭제됩니다.",
      confirmLabel: "삭제",
    })
    if (!confirmed) return

    await deleteOneTimeDues(account.id, duesId)
    if (editingDuesId === duesId) {
      resetOneTimeDuesForm()
    }
    showToast({ tone: "success", title: "삭제 완료", message: "1회성 회비를 삭제했습니다." })
  }

  async function handleDeleteAccount() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.deleteAccount.title,
      message: feedbackPresets.deleteAccount.message,
      confirmLabel: feedbackPresets.deleteAccount.confirmLabel,
    })
    if (!confirmed) return
    await deleteAccount(account.id)
    showToast({ tone: "success", title: feedbackPresets.deleteAccount.successTitle, message: feedbackPresets.deleteAccount.successMessage })
  }

  async function handleCopyAccountNumber() {
    try {
      const clipboard = globalThis.navigator?.clipboard
      if (!clipboard?.writeText) {
        showAlert({
          title: "복사 불가",
          message: "현재 환경에서는 자동 복사를 지원하지 않습니다.",
        })
        return
      }
      await clipboard.writeText(account.accountNumber)
      showToast({ tone: "success", title: "복사 완료", message: "계좌번호를 복사했습니다." })
    } catch {
      showAlert({
        title: "복사 실패",
        message: "브라우저 권한 때문에 자동 복사에 실패했습니다.",
        tone: "danger",
      })
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.pageTitle}>설정</Text>

      <View style={styles.managementSection}>
        <Text style={styles.sectionHeading}>계좌 요약</Text>
        <View style={styles.infoCard}>
          <View style={styles.rowBetween}>
            <View style={styles.infoTitleWrap}>
              <Text style={styles.infoLabel}>계좌 정보</Text>
              <Text style={styles.infoTitle}>{account.bankName}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>Manage</Text>
            </View>
          </View>
          <View style={styles.accountNumberRow}>
            <Text style={styles.accountNumberText}>{account.accountNumber}</Text>
            <Pressable
              onPress={() => void handleCopyAccountNumber()}
              style={styles.copyButton}
              accessibilityRole="button"
              accessibilityLabel="계좌번호 복사"
            >
              <Icon name="copy" size={16} color={uiColors.primary} />
            </Pressable>
          </View>
          <View style={styles.infoMetricsRow}>
            <View style={styles.infoMetricCard}>
              <Text style={styles.infoMetricLabel}>월 회비</Text>
              <Text style={styles.infoMetricValue}>{formatKRW(account.monthlyDuesAmount)}</Text>
            </View>
            <View style={styles.infoMetricCard}>
              <Text style={styles.infoMetricLabel}>납부일</Text>
              <Text style={styles.infoMetricValue}>{account.dueDay}일</Text>
            </View>
          </View>
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>기본 정보</Text>
          <View style={styles.formStack}>
            <InputField value={groupName} onChangeText={setGroupName} label="모임명" placeholder="모임명" />
            <InputField value={bankName} onChangeText={setBankName} label="은행명" placeholder="은행명" />
            <InputField value={accountNumber} onChangeText={setAccountNumber} label="계좌번호" placeholder="계좌번호" />
            <NumericInputField value={monthlyDues} onChangeText={setMonthlyDues} label="월 회비" placeholder="금액" />
            <NumericInputField value={accountDueDay} onChangeText={setAccountDueDay} label="납부일" placeholder="1~28" />
            <Button label="기본정보 저장" onPress={() => void handleSaveAccountInfo()} />
          </View>
        </View>

        <View style={styles.panelCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.panelTitle}>자동이체 설정</Text>
            <ToggleSwitch value={enabled} onPress={() => setEnabled((prev) => !prev)} accessibilityLabel="자동이체 활성화" />
          </View>

          {enabled ? (
            <View style={styles.formStack}>
              <NumericInputField value={day} onChangeText={setDay} label="이체일" placeholder="1~28" />
              <NumericInputField value={amount} onChangeText={setAmount} label="금액" placeholder="금액" />
              <InputField value={fromAccount} onChangeText={setFromAccount} label="출금 계좌" placeholder="출금 계좌" />
              {nextTransferPreview ? <Text style={styles.previewText}>{nextTransferPreview}</Text> : null}
              <Button label="저장" onPress={() => void handleSaveAutoTransfer()} />
            </View>
          ) : (
            <Text style={styles.infoMeta}>자동이체를 켜면 다음 실행일과 출금 정보를 미리 확인할 수 있습니다.</Text>
          )}
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>{editingDuesId ? "1회성 회비 수정" : "1회성 회비"}</Text>
          <View style={styles.formStack}>
            <InputField value={title} onChangeText={setTitle} label="회비 명목" placeholder="회비 명목" />
            <NumericInputField value={duesAmount} onChangeText={setDuesAmount} label="금액" placeholder="금액" />
            <InputField value={dueDate} onChangeText={setDueDate} label="마감일" placeholder="YYYY-MM-DD" />
            <View style={styles.actionRow}>
              {editingDuesId ? <Button label="수정 취소" variant="ghost" onPress={resetOneTimeDuesForm} style={styles.actionButton} /> : null}
              <Button
                label={editingDuesId ? "수정 저장" : "생성"}
                onPress={() => void handleSubmitOneTimeDues()}
                style={styles.actionButton}
              />
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
                        onPress={() => void handleCloseOneTimeDues(dues.id, dues.status === "active")}
                      />
                    </View>
                    <Text style={styles.duesMeta}>마감 {dues.dueDate}</Text>
                    <View style={styles.filterRow}>
                      <ActionChip label="편집" onPress={() => handleEditOneTimeDues(dues.id)} />
                      <ActionChip
                        label={dues.status === "active" ? "마감" : "재개"}
                        onPress={() => void handleCloseOneTimeDues(dues.id, dues.status === "active")}
                      />
                      <ActionChip label="삭제" onPress={() => void handleDeleteOneTimeDues(dues.id)} />
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
                              <Text
                                style={[
                                  styles.statusChipText,
                                  record.status === "paid" ? styles.statusChipTextPaid : styles.statusChipTextUnpaid,
                                ]}
                              >
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
      </View>

      <Button style={styles.dangerAction} variant="danger" label="이 모임통장 삭제" onPress={() => void handleDeleteAccount()} />
    </View>
  )
}

function FilterOption({
  label,
  checked,
  onPress,
}: {
  label: string
  checked: boolean
  onPress: () => void
}) {
  return (
    <Pressable style={styles.filterOption} onPress={onPress}>
      <RadioButton checked={checked} onPress={onPress} />
      <Text style={[styles.filterLabel, checked && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: uiColors.textStrong,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  managementSection: {
    gap: 14,
    paddingTop: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: uiColors.textMuted,
    paddingHorizontal: 8,
    letterSpacing: 0.2,
  },
  infoCard: {
    backgroundColor: uiColors.surface,
    borderRadius: uiRadius.xxl,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: uiColors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: uiColors.textSoft,
    fontWeight: "600",
  },
  infoTitleWrap: {
    gap: 3,
  },
  infoTitle: {
    fontSize: 18,
    color: uiColors.textStrong,
    fontWeight: "700",
  },
  infoMeta: {
    fontSize: 13,
    color: uiColors.textMuted,
  },
  infoBadge: {
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    borderRadius: uiRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoBadgeText: {
    color: uiColors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  accountNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
    backgroundColor: uiColors.surface,
  },
  accountNumberText: {
    flex: 1,
    color: uiColors.textStrong,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  copyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
  },
  infoMetricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoMetricCard: {
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  infoMetricLabel: {
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  infoMetricValue: {
    color: uiColors.textStrong,
    fontSize: 15,
    fontWeight: "700",
  },
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
  previewText: {
    color: uiColors.primary,
    fontSize: 12,
    fontWeight: "600",
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
  dangerAction: {
    marginTop: 14,
  },
})
