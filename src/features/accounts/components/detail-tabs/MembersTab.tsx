import { useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText } from "@shared/lib/validation"
import { ActionChip, Button, InputField, uiColors, uiRadius } from "@shared/ui"
import { getMemberPaymentRate } from "../../model/member-utils"
import type { GroupAccount, MemberRole } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { MemberRow } from "../MemberRow"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

type MemberSort = "name" | "payment-rate"

type RoleFilter = "all" | MemberRole

export function MembersTab({ account }: { account: GroupAccount }) {
  const { createMember, updateMember, deleteMember } = useApp()
  const { showAlert, showToast, confirm } = useFeedback()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<MemberRole>("멤버")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [sortBy, setSortBy] = useState<MemberSort>("payment-rate")

  const avgRate =
    account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) /
    Math.max(account.members.length, 1)
  const editingMember = useMemo(() => account.members.find((member) => member.id === editingId) ?? null, [account.members, editingId])

  const visibleMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return [...account.members]
      .filter((member) => {
        if (roleFilter !== "all" && member.role !== roleFilter) return false
        if (!query) return true
        return member.name.toLowerCase().includes(query) || member.phone.replace(/\D/g, "").includes(query.replace(/\D/g, ""))
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name, "ko")
        }
        const rateDiff = getMemberPaymentRate(account.duesRecords, b.id) - getMemberPaymentRate(account.duesRecords, a.id)
        if (rateDiff !== 0) return rateDiff
        return a.name.localeCompare(b.name, "ko")
      })
  }, [account.duesRecords, account.members, roleFilter, searchQuery, sortBy])

  function resetForm() {
    setEditingId(null)
    setName("")
    setPhone("")
    setRole("멤버")
  }

  async function handleSubmit() {
    const validationError = requireText(name, "멤버 이름을 입력해주세요.") ?? requireText(phone, "연락처를 입력해주세요.")
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
        <SectionHeader title="멤버 검색/정렬" />
        <View style={styles.formStack}>
          <InputField value={searchQuery} onChangeText={setSearchQuery} label="검색" placeholder="이름 또는 연락처" />
          <View style={styles.filterRow}>
            <ActionChip label="전체" active={roleFilter === "all"} onPress={() => setRoleFilter("all")} />
            <ActionChip label="총무" active={roleFilter === "총무"} onPress={() => setRoleFilter("총무")} />
            <ActionChip label="멤버" active={roleFilter === "멤버"} onPress={() => setRoleFilter("멤버")} />
          </View>
          <View style={styles.filterRow}>
            <ActionChip label="납부율순" active={sortBy === "payment-rate"} onPress={() => setSortBy("payment-rate")} />
            <ActionChip label="이름순" active={sortBy === "name"} onPress={() => setSortBy("name")} />
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{editingMember ? "멤버 수정" : "멤버 추가"}</Text>
        <View style={styles.formStack}>
          <InputField value={name} onChangeText={setName} label="이름" placeholder="멤버 이름" />
          <InputField value={phone} onChangeText={setPhone} label="연락처" placeholder="010-0000-0000" />
          <View style={styles.roleRow}>
            {(["총무", "멤버"] as const).map((item) => {
              const active = role === item
              const isManager = item === "총무"
              return (
                <Button
                  key={item}
                  label={item}
                  variant="ghost"
                  onPress={() => setRole(item)}
                  style={[
                    styles.roleButton,
                    active && isManager && styles.roleButtonManagerActive,
                    active && !isManager && styles.roleButtonMemberActive,
                  ]}
                  textStyle={[
                    active && isManager && styles.roleButtonManagerText,
                    active && !isManager && styles.roleButtonMemberText,
                  ]}
                />
              )
            })}
          </View>
          <View style={styles.actionRow}>
            {editingMember ? <Button label="편집 취소" variant="ghost" onPress={resetForm} style={styles.actionButton} /> : null}
            <Button
              label={editingMember ? "멤버 수정" : "멤버 추가"}
              variant="primary"
              onPress={() => void handleSubmit()}
              style={styles.actionButton}
            />
          </View>
        </View>
      </SectionCard>

      {visibleMembers.length > 0 ? (
        <SectionCard>
          <SectionHeader title={`멤버 목록 (${visibleMembers.length})`} />
          <View style={styles.stackCompact}>
            {visibleMembers.map((member) => {
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
        <EmptyStateCard title="조건에 맞는 멤버가 없습니다." description="필터를 바꾸거나 새로운 멤버를 추가해보세요." />
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
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    minHeight: 44,
  },
  roleButtonManagerActive: {
    backgroundColor: uiColors.surfaceMuted,
    borderColor: uiColors.borderStrong,
  },
  roleButtonMemberActive: {
    backgroundColor: uiColors.primarySoft,
    borderColor: uiColors.primaryBorder,
  },
  roleButtonManagerText: {
    color: uiColors.textStrong,
  },
  roleButtonMemberText: {
    color: uiColors.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  summaryLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  metricText: {
    color: uiColors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: uiColors.text,
  },
})
