import { StyleSheet, Text, View } from "react-native"
import { formatKRW, formatMonth } from "@shared/lib/format"
import { uiColors } from "@shared/ui"
import { getExpenseCategoryBreakdown, getMonthlyTransactionTrend } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

export function StatisticsTab({ account }: { account: GroupAccount }) {
  const trend = getMonthlyTransactionTrend(account)
  const breakdown = getExpenseCategoryBreakdown(account)
  const maxAmount = Math.max(...trend.flatMap((item) => [item.income, item.expense]), 1)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title="월별 추이" />
        {trend.length > 0 ? (
          <View style={styles.chartStack}>
            {trend.map((point) => (
              <View key={point.month} style={styles.trendRow}>
                <Text style={styles.rowLabel}>{formatMonth(point.month)}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.incomeBar, { width: `${(point.income / maxAmount) * 100}%` }]} />
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.expenseBar, { width: `${(point.expense / maxAmount) * 100}%` }]} />
                </View>
              </View>
            ))}
            <View style={styles.legendRow}>
              <Text style={styles.legendText}>파랑: 입금</Text>
              <Text style={styles.legendText}>진회색: 출금</Text>
            </View>
          </View>
        ) : (
          <EmptyStateCard title="아직 집계할 거래가 없습니다." description="거래가 쌓이면 월별 추이를 여기서 볼 수 있습니다." />
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="출금 카테고리 비중" />
        {breakdown.length > 0 ? (
          <View style={styles.chartStack}>
            {breakdown.map((item) => (
              <View key={item.category} style={styles.breakdownRow}>
                <View style={styles.breakdownLabelWrap}>
                  <Text style={styles.rowLabel}>{item.category}</Text>
                  <Text style={styles.breakdownMeta}>{formatKRW(item.amount)}</Text>
                </View>
                <View style={styles.breakdownTrack}>
                  <View style={[styles.breakdownFill, { width: `${item.share}%` }]} />
                </View>
                <Text style={styles.breakdownMeta}>{item.share}%</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyStateCard title="출금 내역이 아직 없습니다." description="지출이 생기면 카테고리 비중을 정리해 보여드립니다." />
        )}
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  chartStack: {
    gap: 12,
    marginTop: 10,
  },
  trendRow: {
    gap: 6,
  },
  rowLabel: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: uiColors.surfaceMuted,
  },
  incomeBar: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: uiColors.primary,
  },
  expenseBar: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: uiColors.textStrong,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
  },
  legendText: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownLabelWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  breakdownTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: uiColors.surfaceMuted,
  },
  breakdownFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: uiColors.primarySoft,
  },
  breakdownMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
})
