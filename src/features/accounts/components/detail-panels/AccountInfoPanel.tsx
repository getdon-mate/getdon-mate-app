import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useAppAccounts } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { copyText } from "@shared/lib/clipboard"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateAll, validateDayOfMonth, validatePositiveNumber } from "@shared/lib/validation"
import { Button, DayOfMonthSelectField, Icon, InputField, NumericInputField, uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import type { GroupAccount } from "../../model/types"

export function AccountInfoPanel({ account }: { account: GroupAccount }) {
  const { updateAccount } = useAppAccounts()
  const { showAlert, showToast } = useFeedback()

  const [groupName, setGroupName] = useState(account.groupName)
  const [bankName, setBankName] = useState(account.bankName)
  const [accountNumber, setAccountNumber] = useState(account.accountNumber)
  const [monthlyDues, setMonthlyDues] = useState(String(account.monthlyDuesAmount))
  const [accountDueDay, setAccountDueDay] = useState(String(account.dueDay))

  useEffect(() => {
    setGroupName(account.groupName)
    setBankName(account.bankName)
    setAccountNumber(account.accountNumber)
    setMonthlyDues(String(account.monthlyDuesAmount))
    setAccountDueDay(String(account.dueDay))
  }, [account.id, account.groupName, account.bankName, account.accountNumber, account.monthlyDuesAmount, account.dueDay])

  async function handleCopyAccountNumber() {
    const copied = await copyText(account.accountNumber)
    if (copied) {
      showToast({ tone: "success", title: "복사 완료", message: "계좌번호를 복사했습니다." })
      return
    }
    showAlert({ title: "복사 실패", message: "권한이나 기기 설정 때문에 자동 복사를 완료하지 못했습니다.", tone: "danger" })
  }

  async function handleSaveAccountInfo() {
    const validationError = validateAll(
      requireText(groupName, "모임명을 입력해주세요."),
      requireText(bankName, "은행명을 입력해주세요."),
      requireText(accountNumber, "계좌번호를 입력해주세요."),
      validatePositiveNumber(monthlyDues, "월 회비를 올바르게 입력해주세요."),
      validateDayOfMonth(accountDueDay),
    )
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

  return (
    <View style={styles.stack}>
      <Text style={styles.sectionHeading}>계좌 요약</Text>
      <View style={styles.infoCard}>
        <View style={styles.rowBetween}>
          <View style={styles.infoTitleWrap}>
            <Text style={styles.infoLabel}>계좌 정보</Text>
            <Text style={styles.infoTitle}>{account.bankName}</Text>
          </View>
        </View>
        {account.accountNumber ? (
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
        ) : null}
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
          <DayOfMonthSelectField value={accountDueDay} onChangeValue={setAccountDueDay} label="납부일" placeholder="납부일 선택" />
          <Button label="기본정보 저장" onPress={() => void handleSaveAccountInfo()} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
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
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: uiColors.textStrong,
  },
  formStack: {
    gap: 10,
  },
})
