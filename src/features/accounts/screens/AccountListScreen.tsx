import { useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  ScrollView,
  StyleSheet,
} from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useApp } from "@core/providers/AppProvider"
import { getCurrentMonthKey } from "@shared/lib/date"
import { Button, ConfirmDialog, PageHeader, Toast } from "@shared/ui"
import { AccountCreatePanel } from "../components/AccountCreatePanel"
import { LoadingStateCard } from "../components/LoadingStateCard"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"

export function AccountListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { isBootstrapping, currentUser, accounts, selectAccount, createAccount, logout, withdraw, resetDemoData } = useApp()
  const currentMonth = getCurrentMonthKey()

  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [monthlyDues, setMonthlyDues] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [error, setError] = useState("")
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [withdrawConfirmVisible, setWithdrawConfirmVisible] = useState(false)
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastTitle, setToastTitle] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [toastTone, setToastTone] = useState<"info" | "success" | "warning" | "danger">("info")

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

    if (!groupName.trim() || !bankName.trim() || !accountNumber.trim()) {
      setError("모임명, 은행명, 계좌번호를 모두 입력해주세요.")
      return
    }

    const amount = Number(monthlyDues)
    const day = Number(dueDay)

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("월 회비를 올바르게 입력해주세요.")
      return
    }

    if (!Number.isFinite(day) || day < 1 || day > 28) {
      setError("납부일은 1~28 범위로 입력해주세요.")
      return
    }

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

  function handleWithdraw() {
    setWithdrawConfirmVisible(true)
  }

  function handleResetDemoData() {
    setResetConfirmVisible(true)
  }

  function openToast(tone: "info" | "success" | "warning" | "danger", title: string, message: string) {
    setToastTone(tone)
    setToastTitle(title)
    setToastMessage(message)
    setToastVisible(true)
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <UserHeaderCard user={currentUser} initials={initials} onWithdraw={handleWithdraw} onLogout={logout} />

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

      <ConfirmDialog
        visible={withdrawConfirmVisible}
        title="회원 탈퇴"
        message="정말 탈퇴하시겠습니까?"
        confirmLabel="탈퇴"
        confirmTone="danger"
        onCancel={() => setWithdrawConfirmVisible(false)}
        onConfirm={() => {
          setWithdrawConfirmVisible(false)
          withdraw()
        }}
      />

      <ConfirmDialog
        visible={resetConfirmVisible}
        title="데모 데이터 초기화"
        message="현재 변경 내용을 지우고 초기 mock 데이터로 되돌립니다."
        confirmLabel="초기화"
        confirmTone="danger"
        onCancel={() => setResetConfirmVisible(false)}
        onConfirm={() => {
          setResetConfirmVisible(false)
          resetDemoData()
          openToast("success", "초기화 완료", "데모 데이터를 초기 상태로 되돌렸습니다.")
        }}
      />

      <Toast
        visible={toastVisible}
        tone={toastTone}
        title={toastTitle}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
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
