import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAccounts } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { getErrorMessage } from "@core/api"
import { requireText, validateDayOfMonth, validatePositiveNumber } from "@shared/lib/validation"
import { Icon, PageHeader, uiColors } from "@shared/ui"
import { COPY } from "@shared/constants/copy"
import { AccountCreatePanel } from "../components/AccountCreatePanel"

export function AccountCreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { createAccount } = useAppAccounts()
  const { showToast, showError } = useFeedback()

  const [groupName, setGroupName] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [monthlyDues, setMonthlyDues] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [error, setError] = useState("")
  const [groupNameError, setGroupNameError] = useState("")
  const [bankNameError, setBankNameError] = useState("")
  const [accountNumberError, setAccountNumberError] = useState("")
  const [monthlyDuesError, setMonthlyDuesError] = useState("")
  const [dueDayError, setDueDayError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { width } = useWindowDimensions()
  const isWide = width >= 960

  async function handleCreate() {
    if (submitting) return
    setError("")
    setGroupNameError("")
    setBankNameError("")
    setAccountNumberError("")
    setMonthlyDuesError("")
    setDueDayError("")

    const gnErr = requireText(groupName, "모임명을 입력해주세요.")
    const bnErr = requireText(bankName, "은행명을 입력해주세요.")
    const anErr = requireText(accountNumber, "계좌번호를 입력해주세요.")
    const mdErr = validatePositiveNumber(monthlyDues, "월 회비를 올바르게 입력해주세요.")
    const ddErr = validateDayOfMonth(dueDay)

    if (gnErr) setGroupNameError(gnErr)
    if (bnErr) setBankNameError(bnErr)
    if (anErr) setAccountNumberError(anErr)
    if (mdErr) setMonthlyDuesError(mdErr)
    if (ddErr) setDueDayError(ddErr)

    if (gnErr || bnErr || anErr || mdErr || ddErr) return

    setSubmitting(true)
    try {
      await createAccount({
        groupName: groupName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        monthlyDuesAmount: Number(monthlyDues),
        dueDay: Number(dueDay),
      })
      showToast({ tone: "success", title: "개설 완료", message: COPY.account.createSuccess })
      navigation.navigate(ROUTES.AccountList)
    } catch (err) {
      const message = getErrorMessage(err, "모임통장을 개설하지 못했습니다.")
      setError(message)
      showError(message, "개설 실패")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
              <Icon name="chevronLeft" size={20} color={uiColors.text} />
            </Pressable>
            <PageHeader title={COPY.account.createTitle} subtitle={COPY.account.createSubtitle} />
          </View>
          <AccountCreatePanel
            groupName={groupName}
            bankName={bankName}
            accountNumber={accountNumber}
            monthlyDues={monthlyDues}
            dueDay={dueDay}
            error={error}
            groupNameError={groupNameError}
            bankNameError={bankNameError}
            accountNumberError={accountNumberError}
            monthlyDuesError={monthlyDuesError}
            dueDayError={dueDayError}
            onChangeGroupName={setGroupName}
            onChangeBankName={setBankName}
            onChangeAccountNumber={setAccountNumber}
            onChangeMonthlyDues={setMonthlyDues}
            onChangeDueDay={setDueDay}
            onCancel={() => navigation.goBack()}
            onSubmit={() => void handleCreate()}
            submitting={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.backgroundScreen,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  contentWrap: {
    gap: 16,
  },
  contentWrapWide: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 920,
  },
  topRow: {
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
})
