import { useMemo, useState } from "react"
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { getCurrentMonthKey } from "@shared/lib/date"
import { AccountCreatePanel } from "../components/AccountCreatePanel"
import { AccountSummaryCard } from "../components/AccountSummaryCard"
import { EmptyStateCard } from "../components/EmptyStateCard"
import { UserHeaderCard } from "../components/UserHeaderCard"

export function AccountListScreen() {
  const { currentUser, accounts, selectAccount, createAccount, logout, withdraw, resetDemoData } = useApp()
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

    createAccount({
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
    Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "탈퇴", style: "destructive", onPress: withdraw },
    ])
  }

  function handleResetDemoData() {
    Alert.alert("데모 데이터 초기화", "현재 변경 내용을 지우고 초기 mock 데이터로 되돌립니다.", [
      { text: "취소", style: "cancel" },
      { text: "초기화", style: "destructive", onPress: resetDemoData },
    ])
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <UserHeaderCard user={currentUser} initials={initials} onWithdraw={handleWithdraw} onLogout={logout} />

      <Text style={styles.sectionTitle}>내 모임통장 {accounts.length}개</Text>

      {accounts.length > 0 ? (
        accounts.map((account) => (
          <AccountSummaryCard
            key={account.id}
            account={account}
            currentMonth={currentMonth}
            onPress={() => selectAccount(account.id)}
          />
        ))
      ) : (
        <EmptyStateCard
          title="아직 모임통장이 없습니다."
          description="새 모임통장을 개설해 회비와 거래 관리를 시작해보세요."
        />
      )}

      <Pressable
        style={styles.addCard}
        disabled={createSubmitting}
        onPress={() => {
          setShowCreate((prev) => !prev)
          setError("")
        }}
      >
        <Text style={styles.addCardText}>{showCreate ? "입력 닫기" : "+ 새 모임통장 개설"}</Text>
      </Pressable>

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

      <Pressable style={styles.resetCard} onPress={handleResetDemoData} disabled={createSubmitting}>
        <Text style={styles.resetCardText}>데모 데이터 초기화</Text>
      </Pressable>
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
  sectionTitle: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.35,
    paddingHorizontal: 2,
  },
  addCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 19,
    backgroundColor: "#eff6ff",
  },
  addCardText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 15,
  },
  resetCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    backgroundColor: "#ffffff",
  },
  resetCardText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 13,
  },
})
