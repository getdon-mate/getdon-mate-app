import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { BarChart, PieChart } from "react-native-gifted-charts"
import { formatKRW, formatMonth } from "@shared/lib/format"
import { ActionChip, uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { getExpenseCategoryBreakdown, getMonthlyTransactionTrend, getStatisticsSummary } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

function getTrendRowLabel(month: string) {
  return `${Number(month.split("-")[1])}월`
}

const breakdownPalette = [
  { track: uiColors.primarySoft, fill: uiColors.primary, text: uiColors.primary },
  { track: uiColors.accentSoft, fill: uiColors.accent, text: uiColors.accent },
  { track: "#e4ebff", fill: "#7a8aff", text: "#7a8aff" },
  { track: "#f0e6ff", fill: "#9b7df0", text: "#9b7df0" },
] as const

export function StatisticsTab({ account }: { account: GroupAccount }) {
  const { width } = useWindowDimensions()
  const compact = width < 390
  const trend = getMonthlyTransactionTrend(account)
  const breakdown = getExpenseCategoryBreakdown(account)
  const summary = getStatisticsSummary(account)
  const [selectedMonth, setSelectedMonth] = useState<"all" | string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTrendMonth, setActiveTrendMonth] = useState<string | null>(null)
  const [activeBreakdownCategory, setActiveBreakdownCategory] = useState<string | null>(null)

  const visibleTrend = useMemo(
    () => (selectedMonth === "all" ? trend : trend.filter((item) => item.month === selectedMonth)),
    [selectedMonth, trend]
  )
  const periodOptions = trend
  const maxAmount = Math.max(...visibleTrend.flatMap((item) => [item.income, item.expense]), 1)
  const totalBreakdownAmount = breakdown.reduce((sum, item) => sum + item.amount, 0)
  const focusedCategory = useMemo(
    () => breakdown.find((item) => item.category === selectedCategory) ?? null,
    [breakdown, selectedCategory]
  )
  const spotlightCategory = focusedCategory ?? breakdown[0] ?? null
  const activeTrendPoint = useMemo(
    () => visibleTrend.find((item) => item.month === activeTrendMonth) ?? null,
    [activeTrendMonth, visibleTrend]
  )
  const activeBreakdownPoint = useMemo(
    () => breakdown.find((item) => item.category === activeBreakdownCategory) ?? null,
    [activeBreakdownCategory, breakdown]
  )
  const latestTrendPoint = visibleTrend[visibleTrend.length - 1] ?? null
  const averageExpense =
    visibleTrend.length > 0 ? Math.round(visibleTrend.reduce((sum, item) => sum + item.expense, 0) / visibleTrend.length) : 0
  const trendDetail = activeTrendPoint ?? latestTrendPoint
  const breakdownDetail = activeBreakdownPoint ?? spotlightCategory
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
                  accessibilityLabel={`${formatMonth(point.month)} 기간 필터`}
                  onPress={() => setSelectedMonth(point.month)}
                />
              ))}
            </View>
            <Text style={styles.selectedPeriodLabel}>
              선택 기간 · {selectedMonth === "all" ? "전체" : formatMonth(selectedMonth)}
            </Text>

            <View style={styles.trendDashboard}>
              <View style={styles.trendDetailCard}>
                <Text style={styles.detailEyebrow}>
                  {activeTrendPoint ? `${formatMonth(activeTrendPoint.month)} 세부 금액` : "월을 누르면 세부 금액이 여기에 고정됩니다."}
                </Text>
                <View style={styles.detailMetricRow}>
                  <View style={styles.detailMetricCard}>
                    <Text style={styles.detailMetricLabel}>입금</Text>
                    <Text style={styles.detailMetricValue}>{formatKRW(trendDetail?.income ?? 0)}</Text>
                  </View>
                  <View style={styles.detailMetricCard}>
                    <Text style={styles.detailMetricLabel}>출금</Text>
                    <Text style={styles.detailMetricValue}>{formatKRW(trendDetail?.expense ?? 0)}</Text>
                  </View>
                  <View style={[styles.detailMetricCard, styles.detailMetricCardAccent]}>
                    <Text style={styles.detailMetricLabel}>순변동</Text>
                    <Text style={styles.detailMetricValue}>{formatKRW((trendDetail?.income ?? 0) - (trendDetail?.expense ?? 0))}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.trendBoard} testID="statistics-trend-board">
                <View style={styles.boardHeader}>
                  <View>
                    <Text style={styles.boardEyebrow}>순변동 추이</Text>
                    <Text style={styles.boardTitle}>입금과 출금을 같은 축에서 비교합니다.</Text>
                  </View>
                  <View style={styles.boardSummaryPill}>
                    <Text style={styles.boardSummaryLabel}>평균 출금</Text>
                    <Text style={styles.boardSummaryValue}>{formatKRW(averageExpense)}</Text>
                  </View>
                </View>
                {(() => {
                  const barData = visibleTrend.flatMap((point, i) => [
                    {
                      value: point.income,
                      label: getTrendRowLabel(point.month),
                      frontColor: activeTrendMonth === point.month ? uiColors.primary : uiColors.primarySoft,
                      sideColor: uiColors.primaryBorder,
                      topColor: uiColors.primaryBorder,
                      spacing: 3,
                      onPress: () => setActiveTrendMonth(activeTrendMonth === point.month ? null : point.month),
                    },
                    {
                      value: point.expense,
                      frontColor: activeTrendMonth === point.month ? uiColors.danger : uiColors.dangerSoft,
                      sideColor: uiColors.dangerBorder,
                      spacing: i < visibleTrend.length - 1 ? 16 : 0,
                      onPress: () => setActiveTrendMonth(activeTrendMonth === point.month ? null : point.month),
                    },
                  ])
                  return (
                    <BarChart
                      data={barData}
                      barWidth={22}
                      barBorderTopLeftRadius={5}
                      barBorderTopRightRadius={5}
                      height={160}
                      maxValue={maxAmount === 1 ? 100000 : maxAmount}
                      noOfSections={4}
                      xAxisThickness={1}
                      xAxisColor={uiColors.border}
                      yAxisThickness={0}
                      yAxisTextStyle={{ color: uiColors.textMuted, fontSize: 10 }}
                      rulesType="dashed"
                      rulesColor={uiColors.border}
                      // @ts-ignore yAxisLabelFormatter exists at runtime but missing from types
                      yAxisLabelFormatter={(val: number) =>
                        val >= 10000 ? `${Math.round(val / 10000)}만` : `${val}`
                      }
                      labelWidth={40}
                      xAxisLabelTextStyle={{ color: uiColors.textMuted, fontSize: 11, fontWeight: "600" }}
                      isAnimated
                      animationDuration={400}
                    />
                  )
                })()}
              </View>
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
            <View style={styles.breakdownBoard} testID="statistics-breakdown-board">
              <View style={styles.boardHeader}>
                <View>
                  <Text style={styles.boardEyebrow}>지출 분포</Text>
                  <Text style={styles.boardTitle}>카테고리별 비중을 한 줄에서 비교합니다.</Text>
                </View>
                <View style={styles.boardSummaryPill}>
                  <Text style={styles.boardSummaryLabel}>출금 최다</Text>
                  <Text style={styles.boardSummaryValue}>{spotlightCategory?.category ?? "-"}</Text>
                </View>
              </View>
              <View style={styles.pieChartWrap}>
                <PieChart
                  data={breakdown.map((item, index) => ({
                    value: item.amount,
                    color: breakdownPalette[index % breakdownPalette.length].fill,
                    focused: activeBreakdownCategory === item.category || (!activeBreakdownCategory && index === 0),
                    onPress: () => {
                      setSelectedCategory(item.category)
                      setActiveBreakdownCategory(item.category)
                    },
                  }))}
                  donut
                  innerRadius={60}
                  radius={90}
                  focusOnPress
                  toggleFocusOnPress
                  sectionAutoFocus
                  centerLabelComponent={() => (
                    <View style={styles.pieCenterLabel}>
                      <Text style={styles.pieCenterCategory}>{spotlightCategory?.category ?? "-"}</Text>
                      <Text style={styles.pieCenterShare}>{spotlightCategory?.share ?? 0}%</Text>
                    </View>
                  )}
                  isAnimated
                  animationDuration={500}
                />
              </View>
              <View style={styles.breakdownLegendGrid}>
                {breakdown.map((item, index) => {
                  const palette = breakdownPalette[index % breakdownPalette.length]
                  const active = activeBreakdownCategory === item.category || (!activeBreakdownCategory && index === 0)

                  return (
                    <Pressable
                      key={item.category}
                      style={[styles.legendCard, active && styles.legendCardActive]}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.category} 요약 보기`}
                      onPress={() => {
                        setSelectedCategory(item.category)
                        setActiveBreakdownCategory(item.category)
                      }}
                    >
                      <View style={styles.legendTitleRow}>
                        <View style={[styles.breakdownDot, { backgroundColor: palette.fill }]} />
                        <Text style={[styles.legendTitle, { color: palette.text }]}>{item.category}</Text>
                      </View>
                      <Text style={styles.legendValue}>{item.share}%</Text>
                      <Text style={styles.legendMeta}>{formatKRW(item.amount)}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={styles.breakdownDetailCard}>
              <Text style={styles.detailEyebrow}>
                {activeBreakdownPoint ? `${activeBreakdownPoint.category} 세부 금액` : "카테고리를 누르면 비중과 금액이 여기에 고정됩니다."}
              </Text>
              <View style={styles.breakdownFocusCard}>
                <Text style={styles.breakdownFocusTitle}>
                  {focusedCategory ? "선택 카테고리" : "가장 큰 지출"} · {spotlightCategory?.category ?? "-"}
                </Text>
                <Text style={styles.breakdownFocusMeta}>해당 카테고리 지출 {spotlightCategory?.share ?? 0}%</Text>
              </View>
              <View style={styles.detailMetricRow}>
                <View style={styles.detailMetricCard}>
                  <Text style={styles.detailMetricLabel}>카테고리</Text>
                  <Text style={styles.detailMetricValue}>{breakdownDetail?.category ?? "-"}</Text>
                </View>
                <View style={styles.detailMetricCard}>
                  <Text style={styles.detailMetricLabel}>지출 금액</Text>
                  <Text style={styles.detailMetricValue}>{formatKRW(breakdownDetail?.amount ?? 0)}</Text>
                </View>
                <View style={[styles.detailMetricCard, styles.detailMetricCardAccent]}>
                  <Text style={styles.detailMetricLabel}>비중</Text>
                  <Text style={styles.detailMetricValue}>{breakdownDetail ? `${breakdownDetail.share}%` : "-"}</Text>
                </View>
              </View>
            </View>

            {breakdown.map((item, index) => {
              const palette = breakdownPalette[index % breakdownPalette.length]
              const active = selectedCategory === item.category

              return (
                <Pressable
                  key={item.category}
                  style={[styles.breakdownRow, active && styles.breakdownRowActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.category} 비중 보기`}
                  onPress={() => {
                    setSelectedCategory(item.category)
                    setActiveBreakdownCategory(item.category)
                  }}
                >
                  <View style={styles.breakdownLabelWrap}>
                    <View style={styles.breakdownNameRow}>
                      <View style={[styles.breakdownDot, { backgroundColor: palette.fill }]} />
                      <Text style={[styles.rowLabel, { color: palette.text }]}>{item.category}</Text>
                    </View>
                    <Text style={styles.breakdownMeta}>{formatKRW(item.amount)}</Text>
                  </View>
                  <View style={styles.breakdownRowFooter}>
                    <View style={[styles.breakdownTrack, { backgroundColor: palette.track }]}>
                      <View style={[styles.breakdownFill, { width: `${item.share}%`, backgroundColor: palette.fill }]} />
                    </View>
                    <Text style={styles.breakdownMeta}>{item.share}%</Text>
                  </View>
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
  trendDashboard: {
    gap: uiSpacing.sm,
  },
  trendDetailCard: {
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.backgroundRaised,
    padding: uiSpacing.md,
    gap: uiSpacing.sm,
    minHeight: 122,
  },
  detailEyebrow: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  detailMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: uiSpacing.sm,
  },
  detailMetricCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: uiRadius.lg,
    padding: uiSpacing.md,
    gap: 4,
    backgroundColor: uiColors.surface,
  },
  detailMetricCardAccent: {
    backgroundColor: uiColors.primarySoft,
  },
  detailMetricLabel: {
    color: uiColors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  detailMetricValue: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "800",
  },
  trendBoard: {
    borderRadius: uiRadius.xl,
    padding: uiSpacing.md,
    gap: uiSpacing.md,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.backgroundRaised,
  },
  boardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  boardEyebrow: {
    color: uiColors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  boardTitle: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  boardSummaryPill: {
    minWidth: 104,
    borderRadius: uiRadius.full,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.sm,
    backgroundColor: uiColors.surface,
    borderWidth: 1,
    borderColor: uiColors.border,
    gap: 2,
  },
  boardSummaryLabel: {
    color: uiColors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  boardSummaryValue: {
    color: uiColors.textStrong,
    fontSize: 15,
    fontWeight: "800",
  },
  breakdownBoard: {
    borderRadius: uiRadius.xl,
    padding: uiSpacing.md,
    gap: uiSpacing.md,
    borderWidth: 1,
    borderColor: uiColors.borderStrong,
    backgroundColor: uiColors.backgroundRaised,
  },
  pieChartWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  pieCenterLabel: {
    alignItems: "center",
    gap: 2,
  },
  pieCenterCategory: {
    color: uiColors.textStrong,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  pieCenterShare: {
    color: uiColors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  breakdownLegendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: uiSpacing.sm,
  },
  legendCard: {
    flex: 1,
    minWidth: 116,
    borderRadius: uiRadius.lg,
    padding: uiSpacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  legendCardActive: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  legendTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  legendValue: {
    color: uiColors.textStrong,
    fontSize: 18,
    fontWeight: "800",
  },
  legendMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  breakdownDetailCard: {
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.backgroundRaised,
    padding: uiSpacing.md,
    gap: uiSpacing.sm,
    minHeight: 122,
  },
  breakdownFocusCard: {
    borderRadius: uiRadius.lg,
    padding: uiSpacing.md,
    gap: 4,
    backgroundColor: uiColors.primarySoft,
  },
  breakdownFocusTitle: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "800",
  },
  breakdownFocusMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  breakdownRow: {
    gap: 8,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.backgroundRaised,
  },
  breakdownRowActive: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  breakdownLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  breakdownNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  breakdownRowFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  breakdownTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: uiColors.surfaceMuted,
  },
  breakdownFill: {
    height: "100%",
    borderRadius: 999,
  },
  breakdownMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
})
