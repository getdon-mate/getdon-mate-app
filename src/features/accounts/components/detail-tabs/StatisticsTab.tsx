import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { formatKRW, formatMonth } from "@shared/lib/format"
import { ActionChip, uiColors } from "@shared/ui"
import { getExpenseCategoryBreakdown, getMonthlyTransactionTrend, getStatisticsSummary } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

function getTrendRowLabel(month: string) {
  return `${Number(month.split("-")[1])}월`
}

const breakdownPalette = [
  { track: uiColors.primarySoft, fill: uiColors.primary, chip: uiColors.primarySoft, text: uiColors.primary },
  { track: uiColors.warningSoft, fill: uiColors.warning, chip: uiColors.warningSoft, text: uiColors.warning },
  { track: uiColors.accentSoft, fill: uiColors.textStrong, chip: uiColors.accentSoft, text: uiColors.textStrong },
  { track: uiColors.successSoft, fill: uiColors.success, chip: uiColors.successSoft, text: uiColors.success },
] as const

export function StatisticsTab({ account }: { account: GroupAccount }) {
  const { width } = useWindowDimensions()
  const compact = width < 390
  const trend = getMonthlyTransactionTrend(account)
  const breakdown = getExpenseCategoryBreakdown(account)
  const summary = getStatisticsSummary(account)
  const [selectedMonth, setSelectedMonth] = useState<"all" | string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const visibleTrend = useMemo(
    () => (selectedMonth === "all" ? trend : trend.filter((item) => item.month === selectedMonth)),
    [selectedMonth, trend]
  )
  const periodOptions = selectedMonth === "all" ? trend : visibleTrend
  const maxAmount = Math.max(...visibleTrend.flatMap((item) => [item.income, item.expense]), 1)
  const focusedCategory = useMemo(
    () => breakdown.find((item) => item.category === selectedCategory) ?? null,
    [breakdown, selectedCategory]
  )
  const spotlightCategory = focusedCategory ?? breakdown[0] ?? null
  const summaryCards = [
    { label: "순유입", value: formatKRW(summary.net) },
    { label: "총 출금", value: formatKRW(summary.expense) },
    { label: "미납 인원", value: `${summary.unpaidCount}명` },
  ]

  return (
    <View style={styles.stack}>
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryEyebrow}>운영 요약</Text>
        <View style={styles.summaryRow}>
          {summaryCards.map((card) => (
            <View key={card.label} style={styles.summaryCardWrap}>
              <SectionCard>
                <Text style={styles.summaryLabel}>{card.label}</Text>
                <Text style={styles.summaryValue}>{card.value}</Text>
              </SectionCard>
            </View>
          ))}
        </View>
      </View>
      <SectionCard>
        <SectionHeader title="월별 추이" />
        {trend.length > 0 ? (
          <View style={[styles.chartStack, compact && styles.chartStackCompact]}>
            <View style={styles.filterRow}>
              <ActionChip label="전체" active={selectedMonth === "all"} onPress={() => setSelectedMonth("all")} />
              {periodOptions.map((point) => (
                <ActionChip
                  key={point.month}
                  label={formatMonth(point.month)}
                  active={selectedMonth === point.month}
                  onPress={() => setSelectedMonth(point.month)}
                />
              ))}
            </View>
            <Text style={styles.selectedPeriodLabel}>
              선택 기간 · {selectedMonth === "all" ? "전체" : formatMonth(selectedMonth)}
            </Text>
            {visibleTrend.map((point) => (
              <View key={point.month} style={styles.trendRow}>
                <Text style={styles.rowLabel}>{getTrendRowLabel(point.month)}</Text>
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
          <EmptyStateCard title="아직 집계할 거래가 없습니다." description="거래가 쌓이면 흐름을 여기서 보여줍니다." />
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="출금 카테고리 비중" />
        {breakdown.length > 0 ? (
          <View style={styles.chartStack}>
            {spotlightCategory ? (
              <View style={styles.focusCard}>
                <Text style={styles.focusTitle}>
                  {focusedCategory ? "선택 카테고리" : "가장 큰 지출"} · {spotlightCategory.category}
                </Text>
                <Text style={styles.focusMeta}>해당 카테고리 지출 {spotlightCategory.share}%</Text>
              </View>
            ) : (
              <Text style={styles.breakdownHint}>카테고리를 누르면 비중을 더 자세히 볼 수 있습니다.</Text>
            )}
            {breakdown.map((item, index) => {
              const palette = breakdownPalette[index % breakdownPalette.length]
              const active = selectedCategory === item.category

              return (
                <Pressable key={item.category} style={[styles.breakdownRow, active && styles.breakdownRowActive]} onPress={() => setSelectedCategory(item.category)}>
                  <View style={styles.breakdownLabelWrap}>
                    <Text style={[styles.rowLabel, { color: palette.text }]}>{item.category}</Text>
                    <Text style={styles.breakdownMeta}>{formatKRW(item.amount)}</Text>
                  </View>
                  <View style={[styles.breakdownTrack, { backgroundColor: palette.track }]}>
                    <View style={[styles.breakdownFill, { width: `${item.share}%`, backgroundColor: palette.fill }]} />
                  </View>
                  <Text style={styles.breakdownMeta}>{item.share}%</Text>
                </Pressable>
              )
            })}
          </View>
        ) : (
          <EmptyStateCard title="출금 내역이 아직 없습니다." description="지출이 생기면 비중을 바로 보여줍니다." />
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
  chartStackCompact: {
    gap: 10,
    marginTop: 8,
  },
  summaryBlock: {
    gap: 8,
  },
  summaryEyebrow: {
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  summaryCardWrap: {
    flex: 1,
    minWidth: 108,
  },
  selectedPeriodLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  summaryLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  summaryValue: {
    color: uiColors.textStrong,
    fontSize: 18,
    fontWeight: "800",
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
  focusCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    padding: 12,
    gap: 4,
  },
  focusTitle: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "800",
  },
  focusMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  breakdownHint: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  breakdownRow: {
    gap: 6,
    borderRadius: 14,
    padding: 10,
  },
  breakdownRowActive: {
    backgroundColor: uiColors.surfaceMuted,
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
