import { useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useApp, useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText } from "@shared/lib/validation"
import { ActionChip, Button, InputField, uiColors } from "@shared/ui"
import { getMemberPaymentRate } from "../../model/member-utils"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { MemberRow } from "../MemberRow"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

type MemberSort = "name" | "payment-rate"

type RoleFilter = "all" | "총무" | "멤버"

export function MembersTab({ account }: { account: GroupAccount }) {
  const { createMember, updateMember, deleteMember } = useApp()
  const { showAlert, showToast, confirm } = useFeedback()
  const { currentUser } = useAppAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [sortBy, setSortBy] = useState<MemberSort>("payment-rate")

  const avgRate =
    account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) /
    Math.max(account.members.length, 1)
  const editingMember = useMemo(() => account.members.find((member) => member.id === editingId) ?? null, [account.members, editingId])
  const currentManager = useMemo(() => account.members.find((member) => member.role === "총무") ?? null, [account.members])
  const currentUserMember = useMemo(
    () => account.members.find((member) => member.name === currentUser?.name) ?? null,
    [account.members, currentUser?.name]
  )
  const canDelegateManager = currentUserMember?.role === "총무"

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
      role: "멤버" as const,
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
  }

  async function handleDelegateManager(memberId: string) {
    const targetMember = account.members.find((item) => item.id === memberId)
    if (!targetMember || !currentManager || !canDelegateManager || targetMember.id === currentManager.id) return

    const confirmed = await confirm({
      title: "총무 위임",
      message: `${targetMember.name}님에게 총무 권한을 위임합니다. 위임 후 현재 총무는 일반 멤버로 변경됩니다.`,
      confirmLabel: "위임",
    })
    if (!confirmed) return

    await updateMember(account.id, currentManager.id, {
      name: currentManager.name,
      phone: currentManager.phone,
      role: "멤버",
    })
    await updateMember(account.id, targetMember.id, {
      name: targetMember.name,
      phone: targetMember.phone,
      role: "총무",
    })

    showToast({
      tone: "success",
      title: "위임 완료",
      message: `${targetMember.name}님이 새로운 총무가 되었습니다.`,
    })
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
          <Text style={styles.formHint}>새 멤버는 기본으로 멤버 권한으로 등록됩니다. 현재 총무만 다른 멤버에게 총무를 위임할 수 있고, 현재 총무는 삭제할 수 없습니다.</Text>
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
                  onDelegateOwner={
                    canDelegateManager && member.role !== "총무" && member.id !== currentUserMember?.id
                      ? () => {
                          void handleDelegateManager(member.id)
                        }
                      : undefined
                  }
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
  formHint: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
})
