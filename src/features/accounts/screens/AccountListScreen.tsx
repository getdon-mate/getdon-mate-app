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
import { UserHeaderCard } from "../components/UserHeaderCard"

export function AccountListScreen() {
  const { currentUser, accounts, selectAccount, createAccount, logout, withdraw } = useApp()
  const currentMonth = getCurrentMonthKey()

  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [monthlyDues, setMonthlyDues] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [error, setError] = useState("")

  const initials = useMemo(() => currentUser?.name.slice(-2) ?? "??", [currentUser])

  function resetCreateForm() {
    setGroupName("")
    setBankName("")
    setAccountNumber("")
    setMonthlyDues("")
    setDueDay("")
    setError("")
  }

  function handleCreate() {
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

    createAccount({
      groupName: groupName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      monthlyDuesAmount: amount,
      dueDay: day,
    })

    setShowCreate(false)
    resetCreateForm()
  }

  function handleWithdraw() {
    Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "탈퇴", style: "destructive", onPress: withdraw },
    ])
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <UserHeaderCard user={currentUser} initials={initials} onWithdraw={handleWithdraw} onLogout={logout} />

      <Text style={styles.sectionTitle}>내 모임통장 ({accounts.length})</Text>

      {accounts.map((account) => (
        <AccountSummaryCard
          key={account.id}
          account={account}
          currentMonth={currentMonth}
          onPress={() => selectAccount(account.id)}
        />
      ))}

      <Pressable
        style={styles.addCard}
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
          onCancel={() => {
            setShowCreate(false)
            resetCreateForm()
          }}
          onSubmit={handleCreate}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  sectionTitle: {
    marginTop: 4,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  addCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#eff6ff",
  },
  addCardText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 14,
  },
})
