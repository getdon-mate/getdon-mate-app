import { useState } from "react"
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native"
import { useApp } from "../../../../core/providers/AppProvider"
import { formatKRW, getMemberById } from "../../model/mock-data"
import type { GroupAccount } from "../../model/types"
import { SectionCard } from "../SectionCard"

export function SettingsTab({ account }: { account: GroupAccount }) {
  const { updateAutoTransfer, createOneTimeDues, toggleOneTimeDuesRecord, deleteAccount } = useApp()

  const [enabled, setEnabled] = useState(account.autoTransfer.enabled)
  const [day, setDay] = useState(String(account.autoTransfer.dayOfMonth))
  const [amount, setAmount] = useState(String(account.autoTransfer.amount))
  const [fromAccount, setFromAccount] = useState(account.autoTransfer.fromAccount)

  const [title, setTitle] = useState("")
  const [duesAmount, setDuesAmount] = useState("")
  const [dueDate, setDueDate] = useState("")

  function handleSaveAutoTransfer() {
    const parsedDay = Number(day)
    const parsedAmount = Number(amount)

    if (enabled && (!Number.isFinite(parsedDay) || parsedDay < 1 || parsedDay > 28)) {
      Alert.alert("입력 오류", "이체일은 1~28 범위로 입력해주세요.")
      return
    }

    if (enabled && (!Number.isFinite(parsedAmount) || parsedAmount <= 0)) {
      Alert.alert("입력 오류", "금액을 올바르게 입력해주세요.")
      return
    }

    updateAutoTransfer(account.id, {
      enabled,
      dayOfMonth: Number.isFinite(parsedDay) ? parsedDay : account.autoTransfer.dayOfMonth,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : account.autoTransfer.amount,
      fromAccount,
    })

    Alert.alert("저장 완료", "자동이체 설정을 저장했습니다.")
  }

  function handleCreateOneTimeDues() {
    const parsedAmount = Number(duesAmount)
    if (!title.trim() || !dueDate.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("입력 오류", "1회성 회비 정보를 올바르게 입력해주세요.")
      return
    }

    createOneTimeDues(account.id, {
      title: title.trim(),
      amount: parsedAmount,
      dueDate: dueDate.trim(),
    })

    setTitle("")
    setDuesAmount("")
    setDueDate("")
  }

  function handleDeleteAccount() {
    Alert.alert("모임통장 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteAccount(account.id),
      },
    ])
  }

  return (
    <View style={styles.stack}>
      <SectionCard>
        <Text style={styles.sectionTitle}>통장 정보</Text>
        <Text style={styles.subtleText}>{account.bankName}</Text>
        <Text style={styles.metricText}>{account.accountNumber}</Text>
        <Text style={styles.subtleText}>월 회비 {formatKRW(account.monthlyDuesAmount)} · 납부일 {account.dueDay}일</Text>
      </SectionCard>

      <SectionCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>자동이체 설정</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>

        {enabled && (
          <View style={styles.stackCompact}>
            <TextInput value={day} onChangeText={setDay} placeholder="이체일 (1~28)" style={styles.input} keyboardType="numeric" />
            <TextInput value={amount} onChangeText={setAmount} placeholder="금액" style={styles.input} keyboardType="numeric" />
            <TextInput value={fromAccount} onChangeText={setFromAccount} placeholder="출금 계좌" style={styles.input} />
            <Pressable style={styles.primaryButton} onPress={handleSaveAutoTransfer}>
              <Text style={styles.primaryButtonText}>저장</Text>
            </Pressable>
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>1회성 회비 생성</Text>
        <View style={styles.stackCompact}>
          <TextInput value={title} onChangeText={setTitle} placeholder="회비 명목" style={styles.input} />
          <TextInput value={duesAmount} onChangeText={setDuesAmount} placeholder="금액" style={styles.input} keyboardType="numeric" />
          <TextInput value={dueDate} onChangeText={setDueDate} placeholder="마감일 (YYYY-MM-DD)" style={styles.input} />
          <Pressable style={styles.primaryButton} onPress={handleCreateOneTimeDues}>
            <Text style={styles.primaryButtonText}>생성</Text>
          </Pressable>
        </View>

        {account.oneTimeDues.length > 0 && (
          <View style={styles.stackCompact}>
            {account.oneTimeDues.map((dues) => (
              <View key={dues.id} style={styles.duesCard}>
                <Text style={styles.memberName}>{dues.title} · {formatKRW(dues.amount)}</Text>
                <Text style={styles.memberMeta}>마감 {dues.dueDate}</Text>
                {dues.records.map((record) => {
                  const member = getMemberById(account.members, record.memberId)
                  if (!member) return null
                  return (
                    <View key={`${dues.id}-${record.memberId}`} style={styles.rowBetween}>
                      <Text style={styles.memberMeta}>{member.name}</Text>
                      <Pressable
                        onPress={() => toggleOneTimeDuesRecord(account.id, dues.id, member.id)}
                        style={styles.smallOutlineButton}
                      >
                        <Text style={styles.smallOutlineButtonText}>{record.status === "paid" ? "완납" : "미납"}</Text>
                      </Pressable>
                    </View>
                  )
                })}
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>위험 작업</Text>
        <Pressable style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>이 모임통장 삭제</Text>
        </Pressable>
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  stackCompact: {
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtleText: {
    color: "#64748b",
    fontSize: 12,
  },
  metricText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  duesCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  memberName: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  memberMeta: {
    color: "#64748b",
    fontSize: 12,
  },
  smallOutlineButton: {
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  smallOutlineButtonText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  dangerButtonText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "700",
  },
})
