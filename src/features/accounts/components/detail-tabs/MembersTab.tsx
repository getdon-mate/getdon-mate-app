import { useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText } from "@shared/lib/validation"
import { Button, InputField } from "@shared/ui"
import { getMemberPaymentRate } from "../../model/mock-data"
import type { GroupAccount, MemberRole } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { MemberRow } from "../MemberRow"
import { SectionCard } from "../SectionCard"

export function MembersTab({ account }: { account: GroupAccount }) {
  const { createMember, updateMember, deleteMember } = useApp()
  const { showAlert, showToast, confirm } = useFeedback()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<MemberRole>("멤버")
  const [editingId, setEditingId] = useState<string | null>(null)

  const avgRate =
    account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) /
    Math.max(account.members.length, 1)
  const editingMember = useMemo(
    () => account.members.find((member) => member.id === editingId) ?? null,
    [account.members, editingId]
  )

  function resetForm() {
    setEditingId(null)
    setName("")
    setPhone("")
    setRole("멤버")
  }

  async function handleSubmit() {
    const validationError =
      requireText(name, "멤버 이름을 입력해주세요.") ??
      requireText(phone, "연락처를 입력해주세요.")
    if (validationError) {
      showAlert({ title: "입력 오류", message: validationError, tone: "danger" })
      return
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      role,
    }

    if (editingId) {
      await updateMember(account.id, editingId, payload)
      showToast({ tone: "success", title: "수정 완료", message: "멤버 정보를 수정했습니다." })
      resetForm()
      return
    }

    await createMember(account.id, payload)
    showToast({ tone: "success", title: "추가 완료", message: "새 멤버를 등록했습니다." })
    resetForm()
  }

  function handleEdit(memberId: string) {
    const member = account.members.find((item) => item.id === memberId)
    if (!member) return
    setEditingId(member.id)
    setName(member.name)
    setPhone(member.phone)
    setRole(member.role)
  }

  async function handleDelete(memberId: string) {
    const member = account.members.find((item) => item.id === memberId)
    if (!member) return
    const confirmed = await confirm({
      title: "멤버 삭제",
      message: `${member.name} 멤버를 목록에서 제거합니다.`,
      confirmLabel: "삭제",
      confirmTone: "danger",
    })
    if (!confirmed) return
    await deleteMember(account.id, memberId)
    if (editingId === memberId) {
      resetForm()
    }
    showToast({ tone: "success", title: "삭제 완료", message: "멤버를 제거했습니다." })
  }

  return (
    <View style={styles.stack}>
      <View style={styles.summaryRow}>
        <SectionCard>
          <Text style={styles.summaryLabel}>총 멤버</Text>
          <Text style={styles.metricText}>{account.members.length}명</Text>
        </SectionCard>
        <SectionCard>
          <Text style={styles.summaryLabel}>평균 납부율</Text>
          <Text style={styles.metricText}>{Math.round(avgRate)}%</Text>
        </SectionCard>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>{editingMember ? "멤버 수정" : "멤버 추가"}</Text>
        <View style={styles.formStack}>
          <InputField value={name} onChangeText={setName} label="이름" placeholder="멤버 이름" />
          <InputField value={phone} onChangeText={setPhone} label="연락처" placeholder="010-0000-0000" />
          <View style={styles.roleRow}>
            {(["총무", "멤버"] as const).map((item) => {
              const active = role === item
              return (
                <Button
                  key={item}
                  label={item}
                  variant={active ? "primary" : "ghost"}
                  onPress={() => setRole(item)}
                  style={styles.roleButton}
                />
              )
            })}
          </View>
          <View style={styles.actionRow}>
            {editingMember ? <Button label="편집 취소" variant="ghost" onPress={resetForm} style={styles.actionButton} /> : null}
            <Button
              label={editingMember ? "멤버 수정" : "멤버 추가"}
              onPress={() => void handleSubmit()}
              style={styles.actionButton}
            />
          </View>
        </View>
      </SectionCard>

      {account.members.length > 0 ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>멤버 목록</Text>
          <View style={styles.stackCompact}>
            {account.members.map((member) => {
              const rate = getMemberPaymentRate(account.duesRecords, member.id)
              return (
                <MemberRow
                  key={member.id}
                  member={member}
                  rate={rate}
                  duesRecords={account.duesRecords}
                  onEdit={() => handleEdit(member.id)}
                  onDelete={() => {
                    void handleDelete(member.id)
                  }}
                />
              )
            })}
          </View>
        </SectionCard>
      ) : (
        <EmptyStateCard
          title="등록된 멤버가 없습니다."
          description="멤버가 추가되면 역할과 납부율 정보를 이 화면에서 확인할 수 있습니다."
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  formStack: {
    gap: 10,
    marginTop: 10,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  metricText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
})
