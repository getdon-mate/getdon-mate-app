import { useMemo, useState } from "react"
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useApp } from "../../../core/providers/AppProvider"
import { getCurrentMonthKey } from "../../../shared/lib/date"
import { formatKRW } from "../model/mock-data"
import { getPaymentSummary } from "../model/selectors"

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
      <View style={styles.headerCard}>
        <View style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{currentUser?.name}님</Text>
          <Text style={styles.headerEmail}>{currentUser?.email}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.ghostButton} onPress={handleWithdraw}>
            <Text style={styles.ghostButtonDangerText}>탈퇴</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={logout}>
            <Text style={styles.ghostButtonText}>로그아웃</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>내 모임통장 ({accounts.length})</Text>

      {accounts.map((account) => {
        const { paid } = getPaymentSummary(account, currentMonth)

        return (
          <Pressable key={account.id} style={styles.accountCard} onPress={() => selectAccount(account.id)}>
            <View style={styles.accountHeaderRow}>
              <Text style={styles.accountTitle}>{account.groupName}</Text>
              <Text style={styles.accountMembers}>{account.members.length}명</Text>
            </View>
            <Text style={styles.accountBalance}>{formatKRW(account.balance)}</Text>
            <Text style={styles.accountMeta}>
              {account.bankName} · {paid}/{account.members.length} 완납
            </Text>
          </Pressable>
        )
      })}

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
        <View style={styles.createPanel}>
          <Text style={styles.panelTitle}>새 모임통장 정보</Text>
          <TextInput value={groupName} onChangeText={setGroupName} placeholder="모임명" style={styles.input} />
          <TextInput value={bankName} onChangeText={setBankName} placeholder="은행명" style={styles.input} />
          <TextInput value={accountNumber} onChangeText={setAccountNumber} placeholder="계좌번호" style={styles.input} />
          <TextInput
            value={monthlyDues}
            onChangeText={setMonthlyDues}
            placeholder="월 회비"
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            value={dueDay}
            onChangeText={setDueDay}
            placeholder="납부일 (1~28)"
            style={styles.input}
            keyboardType="numeric"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.panelButtons}>
            <Pressable
              style={styles.outlineButton}
              onPress={() => {
                setShowCreate(false)
                resetCreateForm()
              }}
            >
              <Text style={styles.outlineButtonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleCreate}>
              <Text style={styles.primaryButtonText}>개설하기</Text>
            </Pressable>
          </View>
        </View>
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
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },
  headerEmail: {
    color: "#64748b",
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  ghostButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  ghostButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  ghostButtonDangerText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 4,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 6,
  },
  accountHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  accountMembers: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  accountBalance: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
  },
  accountMeta: {
    color: "#475569",
    fontSize: 12,
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
  createPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
  panelButtons: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  outlineButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
})
