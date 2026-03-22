import { useDeferredValue, useCallback, useEffect, useMemo, useState } from "react"
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from "react-native"
import { useAppAccounts, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText, validateIsoDate, validatePositiveNumber } from "@shared/lib/validation"
import { ActionChip, Button, Icon, InputField, NumericInputField, uiColors } from "@shared/ui"
import { formatFullDate, formatKRW } from "@shared/lib/format"
import { COPY } from "@shared/constants/copy"
import { getMemberById } from "../../model/member-utils"
import { getTransactionTotals, groupTransactionsByDate } from "../../model/selectors"
import type { GroupAccount, Transaction, TransactionType } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { LoadingStateCard } from "../LoadingStateCard"
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
type TxSection = { title: string; data: Transaction[] }

export function TransactionsTab({
  account,
  initialType = "income",
  composerSignal = 0,
}: {
  account: GroupAccount
  initialType?: TransactionType
  composerSignal?: number
}) {
  const { isMutating } = useAppRuntime()
  const { createTransaction, updateTransaction, deleteTransaction } = useAppAccounts()
  const { showToast, confirm } = useFeedback()
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedTxForMenu, setSelectedTxForMenu] = useState<Transaction | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [draftType, setDraftType] = useState<TransactionType>(initialType)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(getToday())
  const [category, setCategory] = useState(getCategoryLabel(initialType))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [amountError, setAmountError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")
  const [categoryError, setCategoryError] = useState("")
  const [dateError, setDateError] = useState("")
  const deferredSearchQuery = useDeferredValue(searchQuery)

  useEffect(() => {
    setDraftType(initialType)
    setCategory((prev) => (editingId ? prev : getCategoryLabel(initialType)))
  }, [composerSignal, editingId, initialType])

  useEffect(() => {
    if (composerSignal > 0) setFormOpen(true)
  }, [composerSignal])

  const isEditing = editingId !== null
  const query = deferredSearchQuery.trim().toLowerCase()

  const categories = useMemo(() => {
    const unique = new Set(account.transactions.map((tx) => tx.category.trim()).filter(Boolean))
    return ["all", ...Array.from(unique)]
  }, [account.transactions])

  const recentCategories = useMemo(() => {
    const unique = new Set<string>()
    for (const tx of account.transactions) {
      const trimmed = tx.category.trim()
      if (!trimmed || unique.has(trimmed)) continue
      unique.add(trimmed)
      if (unique.size === 4) break
    }
    return Array.from(unique)
  }, [account.transactions])
  const recentDraftSuggestions = useMemo(() => {
    const seen = new Set<string>()

    return account.transactions
      .filter((tx) => tx.type === draftType)
      .filter((tx) => {
        const key = `${tx.description}:${tx.category}:${tx.amount}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 3)
  }, [account.transactions, draftType])

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
  const sections: TxSection[] = dates.map((d) => ({
    title: d,
    data: grouped[d],
  }))
  const hasActiveFilter = Boolean(query) || filter !== "all" || categoryFilter !== "all" || sortOrder !== "latest"
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
    setAmountError("")
    setDescriptionError("")
    setCategoryError("")
    setDateError("")
  }

  function resetFilters() {
    setSearchQuery("")
    setFilter("all")
    setCategoryFilter("all")
    setSortOrder("latest")
  }

  const handleSelectSuggestion = useCallback((tx: Transaction) => {
    setAmount(String(tx.amount))
    setDescription(tx.description)
    setCategory(tx.category)
    setDate(tx.date)
  }, [])

  async function handleSubmit() {
    setAmountError("")
    setDescriptionError("")
    setCategoryError("")
    setDateError("")

    const aErr = validatePositiveNumber(amount, "금액을 올바르게 입력해주세요.")
    const dErr = requireText(description, "거래 설명을 입력해주세요.")
    const cErr = requireText(category, "카테고리를 입력해주세요.")
    const dtErr = validateIsoDate(date)

    if (aErr) setAmountError(aErr)
    if (dErr) setDescriptionError(dErr)
    if (cErr) setCategoryError(cErr)
    if (dtErr) setDateError(dtErr)

    if (aErr || dErr || cErr || dtErr) return

    const payload = {
      type: draftType,
      amount: Number(amount),
      description: description.trim(),
      date: date.trim(),
      category: category.trim(),
    }

    if (isEditing && editingId) {
      await updateTransaction(account.id, editingId, payload)
      showToast({ tone: "success", title: COPY.common.editDone, message: COPY.transaction.editDone(payload.description) })
      resetComposer(payload.type)
      setFormOpen(false)
      return
    }

    await createTransaction(account.id, payload)
    showToast({ tone: "success", title: COPY.common.registerDone, message: COPY.transaction.registerDone(payload.description) })
    resetComposer(payload.type)
    setFormOpen(false)
  }

  function handleEdit(transaction: Transaction) {
    setSelectedTxForMenu(null)
    setEditingId(transaction.id)
    setDraftType(transaction.type)
    setAmount(String(transaction.amount))
    setDescription(transaction.description)
    setDate(transaction.date)
    setCategory(transaction.category)
    setFormOpen(true)
  }

  async function handleDelete(transaction: Transaction) {
    setSelectedTxForMenu(null)
    const confirmed = await confirm({
      title: COPY.transaction.deleteTitle,
      message: `${transaction.description} 거래를 삭제합니다.`,
      confirmLabel: COPY.common.delete,
      confirmTone: "danger",
    })
    if (!confirmed) return

    await deleteTransaction(account.id, transaction.id)
    if (editingId === transaction.id) {
      resetComposer(draftType)
    }
    showToast({ tone: "success", title: COPY.common.deleteDone, message: COPY.transaction.deleteDone(transaction.description) })
  }

  return (
    <>
      <SectionList<Transaction, TxSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        style={styles.sectionList}
        contentContainerStyle={styles.sectionListContent}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.addButtonRow}>
              <Pressable
                style={styles.addButton}
                onPress={() => setFormOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="거래 추가"
              >
                <Icon name="plus" size={16} color={uiColors.primary} />
                <Text style={styles.addButtonText}>거래 추가</Text>
              </Pressable>
            </View>

            <SectionCard>
              {(() => {
                const total = income + expense
                const incomeRatio = total > 0 ? (income / total) * 100 : 50
                const net = income - expense
                return (
                  <>
                    <View style={styles.summaryAmountRow}>
                      <View>
                        <Text style={styles.summaryLabel}>총 입금</Text>
                        <Text style={[styles.metricText, styles.incomeText]}>+{formatKRW(income)}</Text>
                      </View>
                      <View style={styles.summaryNetPill}>
                        <Text style={styles.summaryNetLabel}>순변동</Text>
                        <Text style={[styles.summaryNetValue, net >= 0 ? styles.incomeText : styles.expenseText]}>
                          {net >= 0 ? "+" : ""}{formatKRW(net)}
                        </Text>
                      </View>
                      <View style={styles.summaryRightAlign}>
                        <Text style={styles.summaryLabel}>총 출금</Text>
                        <Text style={[styles.metricText, styles.expenseText]}>-{formatKRW(expense)}</Text>
                      </View>
                    </View>
                    <View style={styles.summaryTrack}>
                      <View style={[styles.summaryIncomeFill, { width: `${incomeRatio}%` }]} />
                    </View>
                  </>
                )
              })()}
            </SectionCard>

            <SectionCard>
              <View style={styles.filterHeaderRow}>
                <SectionHeader title="거래 필터" />
                <Pressable
                  style={styles.filterToggle}
                  onPress={() => setFiltersOpen((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityLabel={filtersOpen ? "거래 필터 닫기" : "거래 필터 열기"}
                >
                  <Icon name="filter" size={16} color={uiColors.textStrong} />
                  <Text style={styles.filterToggleText}>{filtersOpen ? "접기" : "필터"}</Text>
                </Pressable>
              </View>
              {filtersOpen ? (
                <View style={styles.filterPanel}>
                  <InputField
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    label="검색"
                    accessibilityLabel="거래 검색"
                    placeholder="설명, 카테고리, 멤버명"
                  />
                  <View style={styles.filterRow}>
                    {(["all", "income", "expense"] as const).map((item) => (
                      <ActionChip
                        key={item}
                        label={item === "all" ? "전체" : item === "income" ? COPY.transaction.income : COPY.transaction.expense}
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
                </View>
              ) : (
                <Text style={styles.filterSummary}>필터를 열어 검색, 유형, 카테고리를 빠르게 좁혀볼 수 있습니다.</Text>
              )}
              {hasActiveFilter ? (
                <Text style={styles.activeFilterSummary}>
                  활성 필터 · {query ? "검색 적용" : "검색 없음"} · {filter === "all" ? "전체" : filter === "income" ? "입금" : "출금"} · {categoryFilter === "all" ? "카테고리 전체" : categoryFilter} · {sortOrder === "latest" ? "최신순" : "오래된순"}
                </Text>
              ) : null}
            </SectionCard>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.dateSectionHeader}>
            <Text style={styles.dateSectionText}>{formatFullDate(section.title)}</Text>
          </View>
        )}
        renderItem={({ item: tx }) => {
          const isMenuOpen = selectedTxForMenu?.id === tx.id
          return (
            <View style={[styles.transactionCard, isMenuOpen && styles.transactionCardOpen]}>
              <View style={styles.transactionCardRow}>
                <View style={styles.transactionContent}>
                  <TransactionRow account={account} tx={tx} />
                </View>
                <Pressable
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  accessibilityRole="button"
                  accessibilityLabel={`${tx.description} ${tx.date} 거래 메뉴 열기`}
                  onPress={() => setSelectedTxForMenu(isMenuOpen ? null : tx)}
                  style={[styles.menuButton, isMenuOpen && styles.menuButtonActive]}
                >
                  <Icon name="ellipsis" size={16} color={isMenuOpen ? uiColors.primary : uiColors.textStrong} />
                </Pressable>
              </View>
              {isMenuOpen ? (
                <View style={styles.inlineMenu}>
                  <Pressable
                    style={styles.inlineMenuItem}
                    onPress={() => { if (selectedTxForMenu) handleEdit(selectedTxForMenu) }}
                    disabled={isMutating}
                  >
                    <Icon name="edit" size={13} color={uiColors.textStrong} />
                    <Text style={styles.inlineMenuItemText}>{COPY.common.edit}</Text>
                  </Pressable>
                  <View style={styles.inlineMenuDivider} />
                  <Pressable
                    style={styles.inlineMenuItem}
                    onPress={() => { if (selectedTxForMenu) void handleDelete(selectedTxForMenu) }}
                    disabled={isMutating}
                  >
                    <Icon name="trash" size={13} color={uiColors.danger} />
                    <Text style={[styles.inlineMenuItemText, styles.inlineMenuItemDanger]}>{COPY.common.delete}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )
        }}
        ListEmptyComponent={
          isMutating ? (
            <View style={styles.headerStack}>
              <LoadingStateCard lines={4} />
              <LoadingStateCard lines={3} />
            </View>
          ) : (
            <EmptyStateCard
              title={hasActiveFilter ? "조건에 맞는 거래가 없습니다." : "표시할 거래내역이 없습니다."}
              description={hasActiveFilter ? "검색어나 필터를 조정하면 다시 거래를 볼 수 있습니다." : "필터를 바꾸거나 새 거래를 추가하면 이 영역에 거래가 표시됩니다."}
              actionLabel={hasActiveFilter ? "필터 초기화" : undefined}
              onAction={hasActiveFilter ? resetFilters : undefined}
            />
          )
        }
      />

      <Modal
        visible={formOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setFormOpen(false); resetComposer(initialType) }}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEditing ? COPY.transaction.editTitle : COPY.transaction.newTitle}</Text>
            <Pressable
              onPress={() => { setFormOpen(false); if (!isEditing) resetComposer(initialType) }}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="폼 닫기"
            >
              <Icon name="close" size={18} color={uiColors.textStrong} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {selectedTransaction ? (
              <Text style={styles.editingMeta}>
                현재 편집 중: {selectedTransaction.description} ({formatKRW(selectedTransaction.amount)})
              </Text>
            ) : null}
            <View style={styles.formTypeRow}>
              {(["income", "expense"] as const).map((item) => {
                const active = draftType === item
                return (
                  <ActionChip
                    key={item}
                    label={item === "income" ? COPY.transaction.income : COPY.transaction.expense}
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
              <NumericInputField
                value={amount}
                onChangeText={setAmount}
                label="금액"
                placeholder="금액"
                containerStyle={styles.compactField}
                inputStyle={styles.compactInput}
                autoFocus={formOpen && !isEditing}
                error={amountError}
              />
              <InputField
                value={date}
                onChangeText={setDate}
                label="거래일"
                placeholder="YYYY-MM-DD"
                containerStyle={styles.compactField}
                inputStyle={styles.compactInput}
                error={dateError}
              />
              <InputField
                value={description}
                onChangeText={setDescription}
                label="설명"
                placeholder="예: 회비 입금, 모임 식비"
                containerStyle={styles.compactField}
                inputStyle={styles.compactInput}
                error={descriptionError}
              />
              <InputField
                value={category}
                onChangeText={setCategory}
                label="카테고리"
                placeholder="예: 회비, 식비"
                containerStyle={styles.compactField}
                inputStyle={styles.compactInput}
                error={categoryError}
              />
            </View>
            {recentCategories.length > 0 ? (
              <View style={styles.recentCategoryWrap}>
                <Text style={styles.recentCategoryLabel}>최근 카테고리</Text>
                <View style={styles.recentCategoryRow}>
                  {recentCategories.map((item) => (
                    <ActionChip key={item} label={item} onPress={() => setCategory(item)} />
                  ))}
                </View>
              </View>
            ) : null}
            {recentDraftSuggestions.length > 0 ? (
              <View style={styles.recentValueWrap}>
                <Text style={styles.recentCategoryLabel}>최근 거래값</Text>
                <View style={styles.recentValueRow}>
                  {recentDraftSuggestions.map((tx) => (
                    <ActionChip
                      key={tx.id}
                      label={`${tx.description} · ${formatKRW(tx.amount)}`}
                      onPress={() => handleSelectSuggestion(tx)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
            <View style={styles.formActionRow}>
              {isEditing ? (
                <Button
                  label={COPY.transaction.cancelEditLabel}
                  variant="ghost"
                  onPress={() => { resetComposer(initialType); setFormOpen(false) }}
                  style={styles.formActionButton}
                  disabled={isMutating}
                />
              ) : null}
              <Button
                label={isMutating ? COPY.transaction.savingLabel : isEditing ? COPY.transaction.editButtonLabel : draftType === "income" ? COPY.transaction.incomeRegisterLabel : COPY.transaction.expenseRegisterLabel}
                onPress={() => void handleSubmit()}
                style={styles.formActionButton}
                disabled={isMutating}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  sectionList: {
    flex: 1,
  },
  sectionListContent: {
    paddingHorizontal: 14,
    paddingBottom: 18,
    gap: 12,
  },
  headerStack: {
    gap: 12,
    marginBottom: 4,
  },
  summaryAmountRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryRightAlign: {
    alignItems: "flex-end",
  },
  summaryNetPill: {
    alignItems: "center",
    gap: 2,
  },
  summaryNetLabel: {
    color: uiColors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  summaryNetValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  summaryTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: uiColors.dangerSoft,
    overflow: "hidden",
    marginTop: 10,
  },
  summaryIncomeFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: uiColors.primary,
  },
  formTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexChip: {
    flex: 1,
  },
  formGrid: {
    gap: 6,
  },
  compactField: {
    gap: 4,
  },
  compactInput: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  recentCategoryWrap: {
    gap: 6,
  },
  recentCategoryLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  recentCategoryRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  recentValueWrap: {
    gap: 6,
  },
  recentValueRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  formActionRow: {
    flexDirection: "row",
    gap: 8,
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
    color: uiColors.primary,
  },
  expenseText: {
    color: uiColors.danger,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterToggleText: {
    color: uiColors.textStrong,
    fontSize: 12,
    fontWeight: "700",
  },
  filterPanel: {
    gap: 4,
    marginTop: 10,
  },
  filterSummary: {
    marginTop: 10,
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  activeFilterSummary: {
    marginTop: 8,
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "600",
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
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
    paddingBottom: 6,
  },
  transactionCardOpen: {
    zIndex: 10,
    overflow: "visible",
  },
  transactionCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  transactionContent: {
    flex: 1,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonActive: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  inlineMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: uiColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: uiColors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  inlineMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inlineMenuItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: uiColors.textStrong,
  },
  inlineMenuItemDanger: {
    color: uiColors.danger,
  },
  inlineMenuDivider: {
    width: 1,
    height: 20,
    backgroundColor: uiColors.border,
  },
  editingMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  dateSectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dateSectionText: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  addButtonRow: {
    marginBottom: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  addButtonText: {
    color: uiColors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: uiColors.textStrong,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: uiColors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    gap: 12,
  },
})
