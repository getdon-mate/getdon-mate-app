import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { getCurrentMonthKey } from "@shared/lib/date"
import { ActionChip, AmountMask, Icon, uiColors, uiRecipes } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import { getMemberById } from "../../model/member-utils"
import { getPaymentSummary, getRecentTransactions } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionHeader } from "../SectionHeader"
import { SectionCard } from "../SectionCard"
import { TransactionRow } from "../TransactionRow"

export function DashboardTab({
  account,
  onOpenTransactions,
  onOpenDues,
  onCopyAccountNumber,
}: {
  account: GroupAccount
  onOpenTransactions: () => void
  onOpenDues: () => void
  onCopyAccountNumber?: () => void
}) {
  const [showBalance, setShowBalance] = useState(true)

  const currentMonth = getCurrentMonthKey()
  const { paid, payableMembers, progress, unpaidMembers } = getPaymentSummary(account, currentMonth)
  const recentTransactions = getRecentTransactions(account)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <View style={styles.accountNumberRow}>
          <Text style={styles.subtleText}>{account.bankName} · {account.accountNumber}</Text>
          <Pressable
            onPress={onCopyAccountNumber}
            accessibilityRole="button"
            accessibilityLabel="대시보드 계좌번호 복사"
            style={styles.copyButton}
          >
            <Icon name="copy" size={14} color={uiColors.primary} />
          </Pressable>
        </View>
        <Text style={styles.balanceLabel}>잔액</Text>
        <View style={styles.balanceWrap}>
          <AmountMask value={formatKRW(account.balance)} masked={!showBalance} textStyle={styles.balanceText} skeletonHeight={28} />
          {!showBalance ? (
            <View pointerEvents="none" style={styles.maskOverlay}>
              <Text style={styles.maskOverlayLabel}>필요할 때만 잔액을 확인하세요</Text>
            </View>
          ) : null}
        </View>
        <ActionChip
          label={showBalance ? "잔액 숨기기" : "잔액 보기"}
          onPress={() => setShowBalance((prev) => !prev)}
          active={showBalance}
          style={styles.chipSelf}
        />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="회비 현황" actionLabel="자세히" onAction={onOpenDues} />
        <View style={styles.summaryPillRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>완납</Text>
            <Text style={styles.summaryPillValue}>{paid}명</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>미납</Text>
            <Text style={styles.summaryPillValue}>{unpaidMembers.length}명</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillLabel}>진행률</Text>
            <Text style={styles.summaryPillValue}>{progress}%</Text>
          </View>
        </View>
        <Text style={styles.metricText}>{paid}/{payableMembers}명 완납</Text>
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
                <View key={record.memberId} style={styles.unpaidRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.unpaidBadge}>
                    <Text style={styles.unpaidText}>{formatKRW(record.amount)} 미납</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="최근 거래" actionLabel="더보기" onAction={onOpenTransactions} />
        {recentTransactions.length > 0 ? (
          <View style={styles.stackCompact}>
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} account={account} tx={tx} />
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="최근 거래가 없습니다."
            description="거래를 추가하면 여기서 바로 확인할 수 있습니다."
            actionLabel="거래 열기"
            onAction={onOpenTransactions}
          />
        )}
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  subtleText: {
    color: "#6b7280",
    fontSize: 12,
  },
  accountNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  copyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
  },
  balanceLabel: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  balanceText: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
  },
  balanceWrap: {
    minHeight: 36,
    justifyContent: "center",
    position: "relative",
  },
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: "rgba(248, 250, 252, 0.84)",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  maskOverlayLabel: {
    color: uiColors.textSoft,
    fontSize: 11,
    fontWeight: "600",
  },
  chipSelf: {
    alignSelf: "flex-start",
  },
  metricText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryPillRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 4,
  },
  rowBetween: uiRecipes.rowBetween,
  summaryPillLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryPillValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  unpaidRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  memberName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  unpaidBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  unpaidText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
})
