import { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { AlertModal, Button, ConfirmDialog, RadioButton, ToggleSwitch } from "@shared/ui"
import { formatKRW, getMemberById } from "../../model/mock-data"
import type { GroupAccount } from "../../model/types"

type RecordFilter = "all" | "paid" | "unpaid"

export function SettingsTab({ account }: { account: GroupAccount }) {
  const { currentUser, updateAutoTransfer, createOneTimeDues, toggleOneTimeDuesRecord, deleteAccount, logout, withdraw } = useApp()

  const [enabled, setEnabled] = useState(account.autoTransfer.enabled)
  const [day, setDay] = useState(String(account.autoTransfer.dayOfMonth))
  const [amount, setAmount] = useState(String(account.autoTransfer.amount))
  const [fromAccount, setFromAccount] = useState(account.autoTransfer.fromAccount)

  const [title, setTitle] = useState("")
  const [duesAmount, setDuesAmount] = useState("")
  const [dueDate, setDueDate] = useState("")

  const [recordFilter, setRecordFilter] = useState<RecordFilter>("all")
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertTone, setAlertTone] = useState<"neutral" | "danger">("neutral")

  function openAlert(titleText: string, messageText: string, tone: "neutral" | "danger" = "neutral") {
    setAlertTitle(titleText)
    setAlertMessage(messageText)
    setAlertTone(tone)
    setAlertVisible(true)
  }

  async function handleSaveAutoTransfer() {
    const parsedDay = Number(day)
    const parsedAmount = Number(amount)

    if (enabled && (!Number.isFinite(parsedDay) || parsedDay < 1 || parsedDay > 28)) {
      openAlert("입력 오류", "이체일은 1~28 범위로 입력해주세요.", "danger")
      return
    }

    if (enabled && (!Number.isFinite(parsedAmount) || parsedAmount <= 0)) {
      openAlert("입력 오류", "금액을 올바르게 입력해주세요.", "danger")
      return
    }

    await updateAutoTransfer(account.id, {
      enabled,
      dayOfMonth: Number.isFinite(parsedDay) ? parsedDay : account.autoTransfer.dayOfMonth,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : account.autoTransfer.amount,
      fromAccount,
    })

    openAlert("저장 완료", "자동이체 설정을 저장했습니다.")
  }

  async function handleCreateOneTimeDues() {
    const parsedAmount = Number(duesAmount)
    if (!title.trim() || !dueDate.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      openAlert("입력 오류", "1회성 회비 정보를 올바르게 입력해주세요.", "danger")
      return
    }

    await createOneTimeDues(account.id, {
      title: title.trim(),
      amount: parsedAmount,
      dueDate: dueDate.trim(),
    })

    setTitle("")
    setDuesAmount("")
    setDueDate("")
    openAlert("생성 완료", "1회성 회비를 생성했습니다.")
  }

  function handleDeleteAccount() {
    setDeleteDialogVisible(true)
  }

  function handleAlertPlaceholder(label: string) {
    openAlert(label, "준비 중인 기능입니다.")
  }

  const profileName = currentUser?.name ?? account.members[0]?.name ?? "사용자"
  const profileEmail = currentUser?.email ?? "email@example.com"
  const profileInitial = profileName.slice(0, 1)

  return (
    <View style={styles.screen}>
      <Text style={styles.pageTitle}>설정</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{profileInitial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.profileEmail}>{profileEmail}</Text>
        </View>
      </View>

      <View style={styles.menuGroup}>
        <SettingsRow label="알림 설정" onPress={() => handleAlertPlaceholder("알림 설정")} />
        <SettingsRow label="프로필 관리" onPress={() => handleAlertPlaceholder("프로필 관리")} />
      </View>

      <View style={styles.managementSection}>
        <Text style={styles.sectionHeading}>모임통장 관리</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>계좌 정보</Text>
          <Text style={styles.infoTitle}>{account.bankName} {account.accountNumber}</Text>
          <Text style={styles.infoMeta}>월 회비 {formatKRW(account.monthlyDuesAmount)} · 납부일 {account.dueDay}일</Text>
        </View>

        <View style={styles.panelCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.panelTitle}>자동이체 설정</Text>
            <ToggleSwitch value={enabled} onPress={() => setEnabled((prev) => !prev)} />
          </View>

          {enabled && (
            <View style={styles.formStack}>
              <TextInput value={day} onChangeText={setDay} placeholder="이체일 (1~28)" style={styles.input} keyboardType="numeric" />
              <TextInput value={amount} onChangeText={setAmount} placeholder="금액" style={styles.input} keyboardType="numeric" />
              <TextInput value={fromAccount} onChangeText={setFromAccount} placeholder="출금 계좌" style={styles.input} />
              <Button label="저장" onPress={() => void handleSaveAutoTransfer()} />
            </View>
          )}
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>1회성 회비 생성</Text>
          <View style={styles.formStack}>
            <TextInput value={title} onChangeText={setTitle} placeholder="회비 명목" style={styles.input} />
            <TextInput value={duesAmount} onChangeText={setDuesAmount} placeholder="금액" style={styles.input} keyboardType="numeric" />
            <TextInput value={dueDate} onChangeText={setDueDate} placeholder="마감일 (YYYY-MM-DD)" style={styles.input} />
            <Button label="생성" onPress={() => void handleCreateOneTimeDues()} />
          </View>

          <View style={styles.filterRow}>
            <FilterOption label="전체" checked={recordFilter === "all"} onPress={() => setRecordFilter("all")} />
            <FilterOption label="완납" checked={recordFilter === "paid"} onPress={() => setRecordFilter("paid")} />
            <FilterOption label="미납" checked={recordFilter === "unpaid"} onPress={() => setRecordFilter("unpaid")} />
          </View>

          {account.oneTimeDues.length > 0 ? (
            <View style={styles.duesList}>
              {account.oneTimeDues.map((dues) => {
                const filteredRecords = dues.records.filter((record) => {
                  if (recordFilter === "all") return true
                  return record.status === recordFilter
                })

                return (
                  <View key={dues.id} style={styles.duesCard}>
                    <Text style={styles.duesTitle}>{dues.title} · {formatKRW(dues.amount)}</Text>
                    <Text style={styles.duesMeta}>마감 {dues.dueDate}</Text>
                    {filteredRecords.length === 0 ? (
                      <Text style={styles.emptyDescription}>선택한 상태의 멤버가 없습니다.</Text>
                    ) : (
                      filteredRecords.map((record) => {
                        const member = getMemberById(account.members, record.memberId)
                        if (!member) return null
                        return (
                          <View key={`${dues.id}-${record.memberId}`} style={styles.rowBetween}>
                            <Text style={styles.recordName}>{member.name}</Text>
                            <Pressable
                              onPress={() => {
                                void toggleOneTimeDuesRecord(account.id, dues.id, member.id)
                              }}
                              style={[
                                styles.statusChip,
                                record.status === "paid" ? styles.statusChipPaid : styles.statusChipUnpaid,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusChipText,
                                  record.status === "paid" ? styles.statusChipTextPaid : styles.statusChipTextUnpaid,
                                ]}
                              >
                                {record.status === "paid" ? "완납" : "미납"}
                              </Text>
                            </Pressable>
                          </View>
                        )
                      })
                    )}
                  </View>
                )
              })}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>등록된 1회성 회비가 없습니다.</Text>
              <Text style={styles.emptyDescription}>위 입력폼에서 회비를 생성하면 멤버별 납부 상태를 관리할 수 있어요.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.menuGroup}>
        <SettingsRow label="로그아웃" onPress={logout} />
        <SettingsRow label="회원 탈퇴" onPress={withdraw} tone="danger" />
      </View>

      <Button style={styles.dangerAction} variant="danger" label="이 모임통장 삭제" onPress={handleDeleteAccount} />

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        tone={alertTone}
        onClose={() => setAlertVisible(false)}
      />

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="모임통장 삭제"
        message="정말 삭제하시겠습니까?"
        confirmLabel="삭제"
        confirmTone="danger"
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={() => {
          setDeleteDialogVisible(false)
          void deleteAccount(account.id)
        }}
      />
    </View>
  )
}

function FilterOption({
  label,
  checked,
  onPress,
}: {
  label: string
  checked: boolean
  onPress: () => void
}) {
  return (
    <Pressable style={styles.filterOption} onPress={onPress}>
      <RadioButton checked={checked} onPress={onPress} />
      <Text style={[styles.filterLabel, checked && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  )
}

function SettingsRow({
  label,
  onPress,
  tone = "default",
}: {
  label: string
  onPress: () => void
  tone?: "default" | "danger"
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <View style={[styles.menuIconBadge, tone === "danger" && styles.menuIconBadgeDanger]}>
          <View style={[styles.menuIconDot, tone === "danger" && styles.menuIconDotDanger]} />
        </View>
        <Text style={[styles.menuLabel, tone === "danger" && styles.menuLabelDanger]}>{label}</Text>
      </View>
      <Text style={styles.menuChevron}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eef1f5",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e7f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#2563eb",
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    gap: 6,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  profileEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  menuGroup: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#edf0f4",
    borderRadius: 18,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f3",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  menuIconBadgeDanger: {
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  menuIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#475569",
  },
  menuIconDotDanger: {
    backgroundColor: "#ef4444",
  },
  menuLabel: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  },
  menuLabelDanger: {
    color: "#ef4444",
  },
  menuChevron: {
    fontSize: 22,
    color: "#c5cad3",
    marginTop: -2,
  },
  managementSection: {
    gap: 12,
    paddingTop: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    paddingHorizontal: 8,
    letterSpacing: 0.2,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: "#edf0f4",
  },
  infoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  infoTitle: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
  },
  infoMeta: {
    fontSize: 13,
    color: "#64748b",
  },
  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#edf0f4",
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
    color: "#111827",
  },
  formStack: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7dce5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  filterLabelActive: {
    color: "#1d4ed8",
  },
  duesList: {
    gap: 10,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 4,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 17,
  },
  duesCard: {
    borderWidth: 1,
    borderColor: "#e6e9ef",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    backgroundColor: "#fbfcfe",
  },
  duesTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  duesMeta: {
    color: "#64748b",
    fontSize: 12,
  },
  recordName: {
    color: "#475569",
    fontSize: 13,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  statusChipPaid: {
    backgroundColor: "#e8f5e9",
    borderColor: "#b7e0bc",
  },
  statusChipUnpaid: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusChipTextPaid: {
    color: "#15803d",
  },
  statusChipTextUnpaid: {
    color: "#dc2626",
  },
  dangerAction: {
    marginTop: 14,
  },
})
