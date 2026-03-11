import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

interface AccountCreatePanelProps {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDues: string
  dueDay: string
  error: string
  onChangeGroupName: (value: string) => void
  onChangeBankName: (value: string) => void
  onChangeAccountNumber: (value: string) => void
  onChangeMonthlyDues: (value: string) => void
  onChangeDueDay: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function AccountCreatePanel({
  groupName,
  bankName,
  accountNumber,
  monthlyDues,
  dueDay,
  error,
  onChangeGroupName,
  onChangeBankName,
  onChangeAccountNumber,
  onChangeMonthlyDues,
  onChangeDueDay,
  onCancel,
  onSubmit,
}: AccountCreatePanelProps) {
  return (
    <View style={styles.createPanel}>
      <Text style={styles.panelTitle}>새 모임통장 정보</Text>
      <TextInput value={groupName} onChangeText={onChangeGroupName} placeholder="모임명" style={styles.input} />
      <TextInput value={bankName} onChangeText={onChangeBankName} placeholder="은행명" style={styles.input} />
      <TextInput value={accountNumber} onChangeText={onChangeAccountNumber} placeholder="계좌번호" style={styles.input} />
      <TextInput
        value={monthlyDues}
        onChangeText={onChangeMonthlyDues}
        placeholder="월 회비"
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        value={dueDay}
        onChangeText={onChangeDueDay}
        placeholder="납부일 (1~28)"
        style={styles.input}
        keyboardType="numeric"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.panelButtons}>
        <Pressable style={styles.outlineButton} onPress={onCancel}>
          <Text style={styles.outlineButtonText}>취소</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>개설하기</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  createPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6e9ef",
    padding: 18,
    gap: 10,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7dce5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  panelButtons: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d7dce5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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
