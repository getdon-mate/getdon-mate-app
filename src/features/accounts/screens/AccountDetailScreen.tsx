import { useMemo, useState } from "react"
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native"
import { useApp } from "../../../core/providers/AppProvider"
import {
  availableMonths,
  formatDate,
  formatFullDate,
  formatKRW,
  formatMonth,
  getMemberById,
  getMemberPaymentRate,
} from "../model/mock-data"
import type { GroupAccount } from "../model/types"
import { getCurrentMonthKey } from "../../../shared/lib/date"
import {
  getPaymentSummary,
  getRecentTransactions,
  getTransactionTotals,
  groupTransactionsByDate,
} from "../model/selectors"
import { SectionCard } from "../components/SectionCard"
import { MemberRow } from "../components/MemberRow"
import { TransactionRow } from "../components/TransactionRow"

type DetailTab = "dashboard" | "dues" | "transactions" | "members" | "settings"

const tabs: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "홈" },
  { key: "dues", label: "회비" },
  { key: "transactions", label: "거래" },
  { key: "members", label: "멤버" },
  { key: "settings", label: "관리" },
]

export function AccountDetailScreen() {
  const { accounts, selectedAccountId, setCurrentView } = useApp()

  const [tab, setTab] = useState<DetailTab>("dashboard")
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])

  const account = useMemo(
    () => accounts.find((candidate) => candidate.id === selectedAccountId),
    [accounts, selectedAccountId]
  )

  if (!account) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>선택된 모임이 없습니다.</Text>
        <Pressable style={styles.primaryButton} onPress={() => setCurrentView("account-list")}>
          <Text style={styles.primaryButtonText}>목록으로</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            setTab("dashboard")
            setCurrentView("account-list")
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.topHeaderTitle}>{account.groupName}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {tab === "dashboard" && (
          <DashboardTab
            account={account}
            onOpenDues={() => setTab("dues")}
            onOpenTransactions={() => setTab("transactions")}
          />
        )}
        {tab === "dues" && (
          <DuesTab account={account} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        )}
        {tab === "transactions" && <TransactionsTab account={account} />}
        {tab === "members" && <MembersTab account={account} />}
        {tab === "settings" && <SettingsTab account={account} />}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((item) => {
          const active = tab === item.key
          return (
            <Pressable key={item.key} style={styles.navItem} onPress={() => setTab(item.key)}>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function DashboardTab({
  account,
  onOpenTransactions,
  onOpenDues,
}: {
  account: GroupAccount
  onOpenTransactions: () => void
  onOpenDues: () => void
}) {
  const [showBalance, setShowBalance] = useState(true)

  const currentMonth = getCurrentMonthKey()
  const { paid, payableMembers, progress, unpaidMembers } = getPaymentSummary(account, currentMonth)
  const recentTransactions = getRecentTransactions(account)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <Text style={styles.subtleText}>{account.bankName} {account.accountNumber}</Text>
        <Text style={styles.balanceLabel}>현재 잔액</Text>
        <Text style={styles.balanceText}>{showBalance ? formatKRW(account.balance) : "***,***원"}</Text>
        <Pressable style={styles.smallOutlineButton} onPress={() => setShowBalance((prev) => !prev)}>
          <Text style={styles.smallOutlineButtonText}>{showBalance ? "잔액 숨기기" : "잔액 보기"}</Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>회비 현황</Text>
          <Pressable onPress={onOpenDues}>
            <Text style={styles.linkText}>자세히</Text>
          </Pressable>
        </View>
        <Text style={styles.metricText}>{paid}/{payableMembers}명 완납 ({progress}%)</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {unpaidMembers.length > 0 && (
          <View style={styles.stackCompact}>
            <Text style={styles.subtleText}>미납 멤버</Text>
            {unpaidMembers.map((record) => {
              const member = getMemberById(account.members, record.memberId)
              if (!member) return null
              return (
                <View key={record.memberId} style={styles.rowBetween}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.unpaidText}>{formatKRW(record.amount)} 미납</Text>
                </View>
              )
            })}
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>최근 거래내역</Text>
          <Pressable onPress={onOpenTransactions}>
            <Text style={styles.linkText}>더보기</Text>
          </Pressable>
        </View>
        <View style={styles.stackCompact}>
          {recentTransactions.map((tx) => (
            <TransactionRow key={tx.id} account={account} tx={tx} />
          ))}
        </View>
      </SectionCard>
    </View>
  )
}

function DuesTab({
  account,
  selectedMonth,
  onSelectMonth,
}: {
  account: GroupAccount
  selectedMonth: string
  onSelectMonth: (month: string) => void
}) {
  const { toggleDues } = useApp()

  const monthIndex = availableMonths.indexOf(selectedMonth)
  const { dues: currentDues, paid, unpaid, exempt, progress } = getPaymentSummary(account, selectedMonth)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <View style={styles.rowBetween}>
          <Pressable
            disabled={monthIndex >= availableMonths.length - 1}
            onPress={() => onSelectMonth(availableMonths[monthIndex + 1])}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowButtonText}>◀</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>{formatMonth(selectedMonth)}</Text>
          <Pressable
            disabled={monthIndex <= 0}
            onPress={() => onSelectMonth(availableMonths[monthIndex - 1])}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowButtonText}>▶</Text>
          </Pressable>
        </View>

        <Text style={styles.metricText}>완납 {paid}명 · 미납 {unpaid}명 · 면제 {exempt}명</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>멤버별 납부 현황</Text>
        <View style={styles.stackCompact}>
          {currentDues.map((record) => {
            const member = getMemberById(account.members, record.memberId)
            if (!member) return null
            return (
              <View key={`${record.memberId}-${record.month}`} style={styles.memberRow}>
                <View style={styles.memberIdentity}>
                  <Text style={[styles.avatar, { backgroundColor: member.color }]}>{member.initials}</Text>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberMeta}>
                      {record.status === "paid" && record.paidDate ? `${formatDate(record.paidDate)} 납부` : record.status === "unpaid" ? "미납" : "면제"}
                    </Text>
                  </View>
                </View>
                {record.status !== "exempt" && (
                  <Pressable
                    style={styles.smallOutlineButton}
                    onPress={() => toggleDues(record.memberId, selectedMonth)}
                  >
                    <Text style={styles.smallOutlineButtonText}>{record.status === "unpaid" ? "완납 처리" : "취소"}</Text>
                  </Pressable>
                )}
              </View>
            )
          })}
        </View>
      </SectionCard>
    </View>
  )
}

function TransactionsTab({ account }: { account: GroupAccount }) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")

  const filtered =
    filter === "all"
      ? account.transactions
      : account.transactions.filter((tx) => tx.type === filter)

  const { income, expense } = getTransactionTotals(account)
  const grouped = groupTransactionsByDate(filtered)

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <View style={styles.stack}>
      <SectionCard>
        <Text style={styles.metricText}>총 입금 +{formatKRW(income)}</Text>
        <Text style={styles.metricText}>총 출금 -{formatKRW(expense)}</Text>
      </SectionCard>

      <View style={styles.filterRow}>
        {(["all", "income", "expense"] as const).map((item) => {
          const active = filter === item
          return (
            <Pressable key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {item === "all" ? "전체" : item === "income" ? "입금" : "출금"}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {dates.map((date) => (
        <SectionCard key={date}>
          <Text style={styles.subtleText}>{formatFullDate(date)}</Text>
          <View style={styles.stackCompact}>
            {grouped[date].map((tx) => (
              <TransactionRow key={tx.id} account={account} tx={tx} />
            ))}
          </View>
        </SectionCard>
      ))}
    </View>
  )
}

function MembersTab({ account }: { account: GroupAccount }) {
  const avgRate =
    account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) /
    Math.max(account.members.length, 1)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <Text style={styles.metricText}>총 멤버 {account.members.length}명</Text>
        <Text style={styles.metricText}>평균 납부율 {Math.round(avgRate)}%</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>멤버 목록</Text>
        <View style={styles.stackCompact}>
          {account.members.map((member) => {
            const rate = getMemberPaymentRate(account.duesRecords, member.id)
            return <MemberRow key={member.id} member={member} rate={rate} duesRecords={account.duesRecords} />
          })}
        </View>
      </SectionCard>
    </View>
  )
}

function SettingsTab({ account }: { account: GroupAccount }) {
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
  screen: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 20,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  backButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
  },
  topHeaderTitle: {
    flex: 1,
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 16,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  navLabelActive: {
    color: "#2563eb",
  },
  stack: {
    gap: 12,
  },
  stackCompact: {
    gap: 8,
    marginTop: 8,
  },
  stackTiny: {
    gap: 2,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  balanceLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  balanceText: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "800",
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
  linkText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  memberIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: "#ffffff",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 8,
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
  unpaidText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  filterChipTextActive: {
    color: "#ffffff",
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
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  duesCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    gap: 6,
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
