import { useMemo, useState } from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useAppAccounts, useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { onlyDigits, requireText, validatePhoneNumber } from "@shared/lib/validation"
import { ActionChip, Button, Icon, InputField, uiColors, uiRadius } from "@shared/ui"
import { COPY } from "@shared/constants/copy"
import { getMemberPaymentRate } from "../../model/member-utils"
import { getLatestReminderForMember } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { MemberRow } from "../MemberRow"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

type MemberSort = "name" | "payment-rate"
type RoleFilter = "all" | "총무" | "멤버"

export function MembersTab({ account }: { account: GroupAccount }) {
  const { createMember, updateMember, delegateManager, deleteMember, sendPaymentReminder, sendTransferRequest } = useAppAccounts()
  const { showAlert, showToast, confirm } = useFeedback()
  const { currentUser } = useAppAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [sortBy, setSortBy] = useState<MemberSort>("payment-rate")
  const [submitting, setSubmitting] = useState(false)
  const [delegatingId, setDelegatingId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const avgRate = useMemo(() => {
    if (account.members.length === 0) return "-"
    if (account.duesRecords.length === 0) return "데이터 없음"
    return `${Math.round(account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) / account.members.length)}%`
  }, [account.members, account.duesRecords])
  const currentManager = useMemo(() => account.members.find((member) => member.role === "총무") ?? null, [account.members])
  const currentUserMember = useMemo(
    () =>
      account.members.find((member) => {
        if (currentUser?.id && member.userId) {
          return member.userId === currentUser.id
        }
        return member.name === currentUser?.name
      }) ?? null,
    [account.members, currentUser?.id, currentUser?.name]
  )
  const canDelegateManager = currentUserMember?.role === "총무"
  const latestMonth = useMemo(
    () => [...new Set(account.duesRecords.map((record) => record.month))].sort((a, b) => b.localeCompare(a))[0] ?? null,
    [account.duesRecords]
  )
  const unpaidMemberIds = useMemo(
    () =>
      new Set(
        account.duesRecords
          .filter((record) => record.month === latestMonth && record.status === "unpaid")
          .map((record) => record.memberId)
      ),
    [account.duesRecords, latestMonth]
  )

  const visibleMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const digitQuery = onlyDigits(query)
    return [...account.members]
      .filter((member) => {
        if (roleFilter !== "all" && member.role !== roleFilter) return false
        if (!query) return true
        const nameMatch = member.name.toLowerCase().includes(query)
        const phoneMatch = digitQuery.length > 0 && member.phone.replace(/\D/g, "").includes(digitQuery)
        return nameMatch || phoneMatch
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
    setName("")
    setPhone("")
    setNameError(undefined)
    setPhoneError(undefined)
  }

  function handleOpenAddModal() {
    resetForm()
    setAddModalOpen(true)
  }

  function handleCloseAddModal() {
    setAddModalOpen(false)
    resetForm()
  }

  async function handleSubmit() {
    if (submitting) return
    const nextNameError = requireText(name, "멤버 이름을 입력해주세요.") ?? undefined
    const nextPhoneError = validatePhoneNumber(phone) ?? undefined
    setNameError(nextNameError)
    setPhoneError(nextPhoneError)

    if (nextNameError || nextPhoneError) {
      showAlert({ title: COPY.common.inputError, message: nextNameError ?? nextPhoneError, tone: "danger" })
      return
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      role: "멤버" as const,
    }

    setSubmitting(true)
    try {
      await createMember(account.id, payload)
      showToast({ tone: "success", title: COPY.common.addDone, message: COPY.member.addDone })
      handleCloseAddModal()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelegateManager(memberId: string) {
    const targetMember = account.members.find((item) => item.id === memberId)
    if (!targetMember || !currentManager || !canDelegateManager || targetMember.id === currentManager.id) return

    const confirmed = await confirm({
      title: COPY.member.delegateTitle,
      message: `${targetMember.name}님에게 총무 권한을 위임합니다. 위임 후 현재 총무는 일반 멤버로 변경됩니다.`,
      confirmLabel: "위임",
    })
    if (!confirmed) return

    setDelegatingId(targetMember.id)
    try {
      await delegateManager(account.id, targetMember.id)
      showToast({
        tone: "success",
        title: "위임 완료",
        message: COPY.member.delegateDone(targetMember.name),
      })
    } finally {
      setDelegatingId(null)
    }
  }

  async function handleDelete(memberId: string) {
    const member = account.members.find((item) => item.id === memberId)
    if (!member) return
    const confirmed = await confirm({
      title: COPY.member.deleteTitle,
      message: `${member.name} 멤버를 목록에서 제거합니다.`,
      confirmLabel: COPY.common.delete,
      confirmTone: "danger",
    })
    if (!confirmed) return
    await deleteMember(account.id, memberId)
    showToast({ tone: "success", title: COPY.common.deleteDone, message: COPY.member.deleteDone })
  }

  async function handleReminder(memberId: string, memberName: string, type: "payment-reminder" | "transfer-request") {
    if (!latestMonth) return

    if (type === "payment-reminder") {
      await sendPaymentReminder(account.id, memberId, latestMonth)
      showToast({ tone: "success", title: COPY.dues.reminderSentTitle, message: COPY.dues.reminderSent(memberName) })
      return
    }

    await sendTransferRequest(account.id, memberId, latestMonth)
    showToast({ tone: "success", title: "송금 요청 전송", message: `${memberName}님께 바로 납부할 수 있도록 요청을 보냈습니다.` })
  }

  return (
    <View style={styles.stack}>
      {/* 요약 정보 영역 : 미사용 */}
      {/* <View style={styles.summaryRow}> */}
        {/* <SectionCard>
          <Text style={styles.summaryLabel}>총 멤버</Text>
          <Text style={styles.metricText}>{account.members.length}명</Text>
        </SectionCard>
        <SectionCard>
          <Text style={styles.summaryLabel}>평균 납부율</Text>
          <Text style={styles.metricText}>{avgRate}</Text>
        </SectionCard> */}
      {/* </View> */}
      {/* 검색/정렬 영역 : 미사용 */}
      {/* ... (생략된 주석들) ... */}

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
                  onDelegateOwner={
                    canDelegateManager && member.role !== "총무" && member.id !== currentUserMember?.id
                      ? () => {
                          void handleDelegateManager(member.id)
                        }
                      : undefined
                  }
                  delegatePending={delegatingId === member.id}
                  onDelete={() => {
                    void handleDelete(member.id)
                  }}
                  reminderActions={
                    unpaidMemberIds.has(member.id) && latestMonth
                      ? [
                          {
                            label: "납부 안내",
                            icon: "megaphone" as const,
                            onPress: () => {
                              void handleReminder(member.id, member.name, "payment-reminder")
                            },
                          },
                          {
                            label: "송금 요청",
                            icon: "transfer" as const,
                            onPress: () => {
                              void handleReminder(member.id, member.name, "transfer-request")
                            },
                          },
                        ]
                      : undefined
                  }
                  reminderNote={
                    unpaidMemberIds.has(member.id)
                      ? (() => {
                          const latestReminder = getLatestReminderForMember(account, member.id)
                          if (!latestReminder) return undefined
                          return `최근 안내 · ${latestReminder.type === "payment-reminder" ? "납부 안내" : "송금 요청"}`
                        })()
                      : undefined
                  }
                  roleNote={member.role === "총무" ? "현재 총무는 삭제할 수 없어요." : undefined}
                />
              )
            })}
          </View>
        </SectionCard>
      ) : (
        <EmptyStateCard
          title="조건에 맞는 멤버가 없습니다."
          description="필터를 바꾸거나 멤버를 추가해보세요."
          actionLabel="검색 초기화"
          onAction={() => {
            setSearchQuery("")
            setRoleFilter("all")
            setSortBy("payment-rate")
          }}
        />
      )}

      <Modal transparent animationType="fade" visible={addModalOpen} onRequestClose={handleCloseAddModal} accessibilityLabel="멤버 추가 모달">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>{COPY.member.addTitle}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="멤버 추가 닫기" onPress={handleCloseAddModal} style={styles.closeButton}>
                <Icon name="close" size={16} color={uiColors.textStrong} />
              </Pressable>
            </View>
            <View style={styles.formStack}>
              <InputField
                value={name}
                onChangeText={(value) => {
                  setName(value)
                  if (nameError) setNameError(undefined)
                }}
                label="이름"
                placeholder="멤버 이름"
                editable={!submitting}
                error={nameError}
              />
              <InputField
                value={phone}
                onChangeText={(value) => {
                  setPhone(value)
                  if (phoneError) setPhoneError(undefined)
                }}
                label="연락처"
                placeholder="010-0000-0000"
                editable={!submitting}
                error={phoneError}
              />
              <View style={styles.actionRow}>
                <Button label={COPY.common.cancel} variant="ghost" onPress={handleCloseAddModal} style={styles.actionButton} disabled={submitting} />
                <Button
                  label={submitting ? COPY.common.processing : COPY.member.addButtonLabel}
                  variant="primary"
                  onPress={() => void handleSubmit()}
                  style={styles.actionButton}
                  disabled={submitting}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    overflow: "visible",
  },
  formStack: {
    gap: 8,
    marginTop: 10,
  },
  addButton: {
    alignSelf: "flex-start",
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: uiColors.overlayStrong,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: uiColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.surfaceMuted,
  },
})
