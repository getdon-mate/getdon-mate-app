import { useEffect, useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useAppAccounts } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { getNextTransferDate } from "@shared/lib/date"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateDayOfMonth, validatePositiveNumber } from "@shared/lib/validation"
import { Button, DayOfMonthSelectField, InputField, NumericInputField, ToggleSwitch, uiColors, uiRadius } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import type { GroupAccount } from "../../model/types"

export function AutoTransferPanel({ account }: { account: GroupAccount }) {
  const { updateAutoTransfer } = useAppAccounts()
  const { showToast } = useFeedback()

  const [enabled, setEnabled] = useState(account.autoTransfer.enabled)
  const [day, setDay] = useState(String(account.autoTransfer.dayOfMonth))
  const [amount, setAmount] = useState(String(account.autoTransfer.amount))
  const [fromAccount, setFromAccount] = useState(account.autoTransfer.fromAccount)

  const [dayError, setDayError] = useState("")
  const [amountError, setAmountError] = useState("")
  const [fromAccountError, setFromAccountError] = useState("")

  useEffect(() => {
    setEnabled(account.autoTransfer.enabled)
    setDay(String(account.autoTransfer.dayOfMonth))
    setAmount(String(account.autoTransfer.amount))
    setFromAccount(account.autoTransfer.fromAccount)
    setDayError("")
    setAmountError("")
    setFromAccountError("")
  }, [account.id, account.autoTransfer.enabled, account.autoTransfer.dayOfMonth, account.autoTransfer.amount, account.autoTransfer.fromAccount])

  const nextTransferPreview = useMemo(() => {
    const parsedDay = Number(day)
    const parsedAmount = Number(amount)
    if (!enabled || !Number.isFinite(parsedDay) || parsedDay < 1 || parsedDay > 28 || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return null
    }
    return `${getNextTransferDate(parsedDay)}에 ${formatKRW(parsedAmount)} 출금 예정`
  }, [amount, day, enabled])

  async function handleSaveAutoTransfer() {
    const parsedDay = Number(day)
    const parsedAmount = Number(amount)

    setDayError("")
    setAmountError("")
    setFromAccountError("")

    if (enabled) {
      const dErr = validateDayOfMonth(day)
      const aErr = validatePositiveNumber(amount, "금액을 올바르게 입력해주세요.")
      const fErr = requireText(fromAccount, "출금 계좌를 입력해주세요.")

      if (dErr) setDayError(dErr)
      if (aErr) setAmountError(aErr)
      if (fErr) setFromAccountError(fErr)

      if (dErr || aErr || fErr) return
    }

    await updateAutoTransfer(account.id, {
      enabled,
      dayOfMonth: Number.isFinite(parsedDay) ? parsedDay : account.autoTransfer.dayOfMonth,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : account.autoTransfer.amount,
      fromAccount: fromAccount.trim(),
    })

    showToast(feedbackPresets.autoTransferSaved)
  }

  return (
    <View style={styles.panelCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>자동이체 설정</Text>
        <ToggleSwitch
          value={enabled}
          onPress={() => {
            setEnabled((prev) => !prev)
            setDayError("")
            setAmountError("")
            setFromAccountError("")
          }}
          accessibilityLabel="자동이체 활성화"
        />
      </View>

      {enabled ? (
        <View style={styles.formStack}>
          <DayOfMonthSelectField value={day} onChangeValue={setDay} label="이체일" placeholder="이체일 선택" error={dayError} />
          <NumericInputField value={amount} onChangeText={setAmount} label="금액" placeholder="금액" error={amountError} />
          <InputField value={fromAccount} onChangeText={setFromAccount} label="출금 계좌" placeholder="출금 계좌" error={fromAccountError} />
          {nextTransferPreview ? <Text style={styles.previewText}>{nextTransferPreview}</Text> : null}
          <Button label="저장" onPress={() => void handleSaveAutoTransfer()} />
        </View>
      ) : (
        <Text style={styles.infoMeta}>자동이체를 켜면 다음 실행일과 출금 정보를 미리 확인할 수 있습니다.</Text>
      )}
    </View>
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
  previewText: {
    color: uiColors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  infoMeta: {
    fontSize: 13,
    color: uiColors.textMuted,
  },
})
