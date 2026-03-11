import { StyleSheet, Text, View } from "react-native"
import { Button, Card, InputField } from "@shared/ui"

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
  submitting?: boolean
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
  submitting = false,
}: AccountCreatePanelProps) {
  return (
    <Card style={styles.createPanel}>
      <Text style={styles.panelTitle}>새 모임통장 정보</Text>
      <InputField value={groupName} onChangeText={onChangeGroupName} placeholder="모임명" editable={!submitting} />
      <InputField value={bankName} onChangeText={onChangeBankName} placeholder="은행명" editable={!submitting} />
      <InputField value={accountNumber} onChangeText={onChangeAccountNumber} placeholder="계좌번호" editable={!submitting} />
      <InputField
        value={monthlyDues}
        onChangeText={onChangeMonthlyDues}
        placeholder="월 회비"
        keyboardType="numeric"
        editable={!submitting}
      />
      <InputField
        value={dueDay}
        onChangeText={onChangeDueDay}
        placeholder="납부일 (1~28)"
        keyboardType="numeric"
        editable={!submitting}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.panelButtons}>
        <Button
          style={styles.actionButton}
          variant="ghost"
          label="취소"
          onPress={onCancel}
          disabled={submitting}
        />
        <Button
          style={styles.actionButton}
          label={submitting ? "개설 중..." : "개설하기"}
          onPress={onSubmit}
          disabled={submitting}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  createPanel: {
    gap: 10,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  panelButtons: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
})
