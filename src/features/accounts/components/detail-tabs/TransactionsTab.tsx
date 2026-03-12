import { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText, validateIsoDate, validatePositiveNumber } from "@shared/lib/validation"
import { ActionChip, Button, InputField, NumericInputField, uiColors } from "@shared/ui"
import { formatFullDate, formatKRW } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import { getTransactionTotals, groupTransactionsByDate } from "../../model/selectors"
import type { GroupAccount, Transaction, TransactionType } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"
import { TransactionRow } from "../TransactionRow"

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function getCategoryLabel(type: TransactionType) {
  return type === "income" ? "입금" : "출금"
}

type SortOrder = "latest" | "oldest"

export function TransactionsTab({
  account,
  initialType = "income",
  composerSignal = 0,
}: {
  account: GroupAccount
  initialType?: TransactionType
  composerSignal?: number
}) {
  const { createTransaction, updateTransaction, deleteTransaction } = useApp()
  const { showAlert, showToast, confirm } = useFeedback()
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [draftType, setDraftType] = useState<TransactionType>(initialType)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(getToday())
  const [category, setCategory] = useState(getCategoryLabel(initialType))
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setDraftType(initialType)
    setCategory((prev) => (editingId ? prev : getCategoryLabel(initialType)))
  }, [composerSignal, editingId, initialType])

  const isEditing = editingId !== null
  const query = searchQuery.trim().toLowerCase()

  const categories = useMemo(() => {
    const unique = new Set(account.transactions.map((tx) => tx.category.trim()).filter(Boolean))
    return ["all", ...Array.from(unique)]
  }, [account.transactions])

  const filtered = useMemo(() => {
    const byType =
      filter === "all" ? account.transactions : account.transactions.filter((tx) => tx.type === filter)

    return byType
      .filter((tx) => {
        if (categoryFilter !== "all" && tx.category !== categoryFilter) return false
        if (!query) return true
        const memberName = tx.memberId ? getMemberById(account.members, tx.memberId)?.name ?? "" : ""
        return [tx.description, tx.category, tx.date, memberName].join(" ").toLowerCase().includes(query)
      })
      .sort((a, b) => {
        const base = a.date.localeCompare(b.date)
        if (base !== 0) {
          return sortOrder === "latest" ? -base : base
        }
        return sortOrder === "latest" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
      })
  }, [account.members, account.transactions, categoryFilter, filter, query, sortOrder])

  const { income, expense } = getTransactionTotals(account)
  const grouped = groupTransactionsByDate(filtered)
  const dates = Object.keys(grouped).sort((a, b) =>
    sortOrder === "latest" ? b.localeCompare(a) : a.localeCompare(b)
  )
  const selectedTransaction = useMemo(
    () => account.transactions.find((tx) => tx.id === editingId) ?? null,
    [account.transactions, editingId]
  )

  function resetComposer(nextType = draftType) {
    setEditingId(null)
    setDraftType(nextType)
    setAmount("")
    setDescription("")
    setDate(getToday())
    setCategory(getCategoryLabel(nextType))
  }

  async function handleSubmit() {
    const validationError =
      requireText(description, "거래 설명을 입력해주세요.") ??
      validatePositiveNumber(amount, "금액을 올바르게 입력해주세요.") ??
      requireText(category, "카테고리를 입력해주세요.") ??
      validateIsoDate(date)

    if (validationError) {
      showAlert({ title: "입력 오류", message: validationError, tone: "danger" })
      return
    }

    const payload = {
      type: draftType,
      amount: Number(amount),
      description: description.trim(),
      date: date.trim(),
      category: category.trim(),
    }

    if (isEditing && editingId) {
      await updateTransaction(account.id, editingId, payload)
      showToast({ tone: "success", title: "수정 완료", message: "거래내역을 수정했습니다." })
      resetComposer(payload.type)
      return
    }

    await createTransaction(account.id, payload)
    showToast({ tone: "success", title: "등록 완료", message: "거래내역을 추가했습니다." })
    resetComposer(payload.type)
  }

  function handleEdit(transaction: Transaction) {
    setEditingId(transaction.id)
    setDraftType(transaction.type)
    setAmount(String(transaction.amount))
    setDescription(transaction.description)
    setDate(transaction.date)
    setCategory(transaction.category)
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = await confirm({
      title: "거래 삭제",
      message: "선택한 거래내역을 삭제합니다.",
      confirmLabel: "삭제",
      confirmTone: "danger",
    })
    if (!confirmed) return

    await deleteTransaction(account.id, transaction.id)
    if (editingId === transaction.id) {
      resetComposer(draftType)
    }
    showToast({ tone: "success", title: "삭제 완료", message: "거래내역을 제거했습니다." })
  }

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title={isEditing ? "거래 수정" : "새 거래 등록"} />
        <View style={styles.formTypeRow}>
          {(["income", "expense"] as const).map((item) => {
            const active = draftType === item
            return (
              <ActionChip
                key={item}
                label={item === "income" ? "입금" : "출금"}
                active={active}
                style={styles.flexChip}
                onPress={() => {
                  setDraftType(item)
                  if (!isEditing) {
                    setCategory(getCategoryLabel(item))
                  }
                }}
              />
            )
          })}
        </View>
        <View style={styles.formGrid}>
          <NumericInputField value={amount} onChangeText={setAmount} label="금액" placeholder="금액" />
          <InputField value={date} onChangeText={setDate} label="거래일" placeholder="YYYY-MM-DD" />
          <InputField value={description} onChangeText={setDescription} label="설명" placeholder="예: 회비 입금, 모임 식비" />
          <InputField value={category} onChangeText={setCategory} label="카테고리" placeholder="예: 회비, 식비" />
        </View>
        <View style={styles.formActionRow}>
          {isEditing ? <Button label="편집 취소" variant="ghost" onPress={() => resetComposer(initialType)} style={styles.formActionButton} /> : null}
          <Button
            label={isEditing ? "거래 수정" : draftType === "income" ? "입금 등록" : "출금 등록"}
            onPress={() => void handleSubmit()}
            style={styles.formActionButton}
          />
        </View>
      </SectionCard>

      <View style={styles.summaryRow}>
        <SectionCard>
          <Text style={styles.summaryLabel}>총 입금</Text>
          <Text style={[styles.metricText, styles.incomeText]}>+{formatKRW(income)}</Text>
        </SectionCard>
        <SectionCard>
          <Text style={styles.summaryLabel}>총 출금</Text>
          <Text style={[styles.metricText, styles.expenseText]}>-{formatKRW(expense)}</Text>
        </SectionCard>
      </View>

      <SectionCard>
        <SectionHeader title="거래 필터" />
        <InputField value={searchQuery} onChangeText={setSearchQuery} label="검색" placeholder="설명, 카테고리, 멤버명" />
        <View style={styles.filterRow}>
          {(["all", "income", "expense"] as const).map((item) => (
            <ActionChip
              key={item}
              label={item === "all" ? "전체" : item === "income" ? "입금" : "출금"}
              active={filter === item}
              onPress={() => setFilter(item)}
            />
          ))}
          <ActionChip
            label={sortOrder === "latest" ? "최신순" : "오래된순"}
            active
            onPress={() => setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"))}
          />
        </View>
        <View style={styles.filterRow}>
          {categories.map((item) => (
            <ActionChip
              key={item}
              label={item === "all" ? "카테고리 전체" : item}
              active={categoryFilter === item}
              onPress={() => setCategoryFilter(item)}
            />
          ))}
        </View>
      </SectionCard>

      {dates.length > 0 ? (
        dates.map((date) => (
          <SectionCard key={date}>
            <Text style={styles.subtleText}>{formatFullDate(date)}</Text>
            <View style={styles.stackCompact}>
              {grouped[date].map((tx) => (
                <View key={tx.id} style={styles.transactionCard}>
                  <TransactionRow account={account} tx={tx} />
                  <View style={styles.inlineActions}>
                    <Button label="수정" variant="ghost" onPress={() => handleEdit(tx)} style={styles.inlineActionButton} />
                    <Button
                      label="삭제"
                      variant="danger"
                      onPress={() => {
                        void handleDelete(tx)
                      }}
                      style={styles.inlineActionButton}
                    />
                  </View>
                </View>
              ))}
            </View>
          </SectionCard>
        ))
      ) : (
        <EmptyStateCard
          title="표시할 거래내역이 없습니다."
          description="필터를 바꾸거나 새 거래를 추가하면 이 영역에 거래가 표시됩니다."
        />
      )}

      {selectedTransaction ? (
        <Text style={styles.editingMeta}>
          현재 편집 중: {selectedTransaction.description} ({formatKRW(selectedTransaction.amount)})
        </Text>
      ) : null}
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
  formTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  flexChip: {
    flex: 1,
  },
  formGrid: {
    gap: 8,
    marginTop: 8,
  },
  formActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  formActionButton: {
    flex: 1,
  },
  summaryLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  metricText: {
    fontSize: 18,
    fontWeight: "800",
  },
  incomeText: {
    color: uiColors.success,
  },
  expenseText: {
    color: uiColors.text,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  subtleText: {
    color: uiColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  transactionCard: {
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
    paddingBottom: 8,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
  },
  inlineActionButton: {
    minWidth: 70,
    paddingVertical: 8,
  },
  editingMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
})
