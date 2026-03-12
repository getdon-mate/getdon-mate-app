import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  ScrollView,
  StyleSheet,
} from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText, validateDayOfMonth, validatePositiveNumber } from "@shared/lib/validation"
import { getCurrentMonthKey } from "@shared/lib/date"
import { Button, PageHeader } from "@shared/ui"
import { AccountCreatePanel } from "../components/AccountCreatePanel"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"

export function AccountListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { isBootstrapping, currentUser, accounts, selectAccount, createAccount, logout, withdraw, resetDemoData } = useApp()
  const { confirm, showToast } = useFeedback()
  const currentMonth = getCurrentMonthKey()

  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [monthlyDues, setMonthlyDues] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [error, setError] = useState("")
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const initials = useMemo(() => currentUser?.name.slice(-2) ?? "??", [currentUser])

  function resetCreateForm() {
    setGroupName("")
    setBankName("")
    setAccountNumber("")
    setMonthlyDues("")
    setDueDay("")
    setError("")
  }

  async function handleCreate() {
    if (createSubmitting) return
    setError("")

    const validationError =
      requireText(groupName, "모임명을 입력해주세요.") ??
      requireText(bankName, "은행명을 입력해주세요.") ??
      requireText(accountNumber, "계좌번호를 입력해주세요.") ??
      validatePositiveNumber(monthlyDues, "월 회비를 올바르게 입력해주세요.") ??
      validateDayOfMonth(dueDay)
    if (validationError) {
      setError(validationError)
      return
    }

    const amount = Number(monthlyDues)
    const day = Number(dueDay)

    setCreateSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    await createAccount({
      groupName: groupName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      monthlyDuesAmount: amount,
      dueDay: day,
    })

    setShowCreate(false)
    resetCreateForm()
    setCreateSubmitting(false)
  }

  async function handleWithdraw() {
    const confirmed = await confirm({
      title: "회원 탈퇴",
      message: "회원과 데모 계정 정보가 제거됩니다. 정말 탈퇴하시겠습니까?",
      confirmLabel: "탈퇴",
      confirmTone: "danger",
    })
    if (!confirmed) return
    withdraw()
    showToast({ tone: "success", title: "탈퇴 완료", message: "계정이 정리되었습니다." })
  }

  async function handleResetDemoData() {
    const confirmed = await confirm({
      title: "데모 데이터 초기화",
      message: "현재 변경 내용을 지우고 초기 mock 데이터로 되돌립니다.",
      confirmLabel: "초기화",
      confirmTone: "danger",
    })
    if (!confirmed) return
    resetDemoData()
    showToast({ tone: "success", title: "초기화 완료", message: "데모 데이터를 초기 상태로 되돌렸습니다." })
  }

  async function handleLogout() {
    const confirmed = await confirm({
      title: "로그아웃",
      message: "현재 세션을 종료하고 로그인 화면으로 이동합니다.",
      confirmLabel: "로그아웃",
    })
    if (!confirmed) return
    logout()
    showToast({ tone: "success", title: "로그아웃 완료", message: "로그인 화면으로 이동합니다." })
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <UserHeaderCard user={currentUser} initials={initials} onWithdraw={() => void handleWithdraw()} onLogout={() => void handleLogout()} />

      <PageHeader title="모임통장" subtitle={`내 모임통장 ${accounts.length}개`} />

      {isBootstrapping ? (
        <>
          <LoadingStateCard />
          <LoadingStateCard />
        </>
      ) : accounts.length > 0 ? (
        accounts.map((account) => (
          <AccountSummaryCard
            key={account.id}
            account={account}
            currentMonth={currentMonth}
            onPress={() => {
              selectAccount(account.id)
              navigation.navigate("AccountDetail")
            }}
          />
        ))
      ) : (
        <EmptyStateCard
          title="아직 모임통장이 없습니다."
          description="새 모임통장을 개설해 회비와 거래 관리를 시작해보세요."
        />
      )}

      {!isBootstrapping ? (
        <Button
          style={styles.addCard}
          variant="secondary"
          label={showCreate ? "입력 닫기" : "+ 새 모임통장 개설"}
          disabled={createSubmitting}
          onPress={() => {
            setShowCreate((prev) => !prev)
            setError("")
          }}
        />
      ) : null}

      {showCreate && (
        <AccountCreatePanel
          groupName={groupName}
          bankName={bankName}
          accountNumber={accountNumber}
          monthlyDues={monthlyDues}
          dueDay={dueDay}
          error={error}
          onChangeGroupName={setGroupName}
          onChangeBankName={setBankName}
          onChangeAccountNumber={setAccountNumber}
          onChangeMonthlyDues={setMonthlyDues}
          onChangeDueDay={setDueDay}
          submitting={createSubmitting}
          onCancel={() => {
            setShowCreate(false)
            resetCreateForm()
          }}
          onSubmit={handleCreate}
        />
      )}

      {!isBootstrapping ? (
        <Button
          style={styles.resetCard}
          variant="danger"
          label="데모 데이터 초기화"
          onPress={handleResetDemoData}
          disabled={createSubmitting}
        />
      ) : null}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
    paddingBottom: 30,
  },
  addCard: {
    borderStyle: "dashed",
  },
  resetCard: {
    marginTop: -2,
  },
})
