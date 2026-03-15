import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useEffect, useMemo, useState } from "react"
import { formatDate } from "@shared/lib/format"
import { Button, Icon, uiColors } from "@shared/ui"
import { getCalendarEvents, getCalendarEventsForDate } from "../../model/selectors"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

function getDatesForMonth(referenceMonth: string) {
  const [year, month] = referenceMonth.split("-").map(Number)
  const days = new Date(year, month, 0).getDate()
  return Array.from({ length: days }, (_, index) => `${referenceMonth}-${String(index + 1).padStart(2, "0")}`)
}

function getToneLabel(tone: "dues" | "transaction" | "notice") {
  return tone === "dues" ? "회비" : tone === "transaction" ? "거래" : "공지"
}

function getToneStyles(tone: "dues" | "transaction" | "notice") {
  if (tone === "dues") {
    return {
      borderColor: uiColors.primaryBorder,
      backgroundColor: uiColors.primarySoft,
      color: uiColors.primary,
    }
  }
  if (tone === "transaction") {
    return {
      borderColor: uiColors.warningBorder,
      backgroundColor: uiColors.warningSoft,
      color: uiColors.warning,
    }
  }
  return {
    borderColor: uiColors.accentBorder,
    backgroundColor: uiColors.accentSoft,
    color: uiColors.textStrong,
  }
}

function shiftMonth(referenceMonth: string, offset: number) {
  const [year, month] = referenceMonth.split("-").map(Number)
  const nextDate = new Date(year, month - 1 + offset, 1)
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`
}

function getMonthLabel(referenceMonth: string) {
  const [year, month] = referenceMonth.split("-").map(Number)
  return `${year}년 ${month}월`
}

function getInitialDateForMonth(events: ReturnType<typeof getCalendarEvents>, month: string) {
  return events.find((event) => event.date.startsWith(month))?.date ?? `${month}-01`
}

export function CalendarTab({
  account,
  onOpenQuickAction,
}: {
  account: GroupAccount
  onOpenQuickAction?: (target: "dues" | "transactions" | "board") => void
}) {
  const { width } = useWindowDimensions()
  const compact = width < 390
  const events = getCalendarEvents(account)
  const latestDate = events[events.length - 1]?.date ?? new Date().toISOString().slice(0, 10)
  const initialMonth = latestDate.slice(0, 7)
  const availableMonths = useMemo(() => [...new Set(events.map((event) => event.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a)), [events])
  const [visibleMonth, setVisibleMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState(latestDate)
  const dates = useMemo(() => getDatesForMonth(visibleMonth), [visibleMonth])
  const monthIndex = availableMonths.indexOf(visibleMonth)
  const disablePreviousMonth = monthIndex < 0 || monthIndex >= availableMonths.length - 1
  const disableNextMonth = monthIndex <= 0

  useEffect(() => {
    setVisibleMonth(initialMonth)
    setSelectedDate(latestDate)
  }, [initialMonth, latestDate])

  const focusedEvents = useMemo(() => getCalendarEventsForDate(events, selectedDate), [events, selectedDate])

  function handleChangeMonth(offset: number) {
    const nextMonth = shiftMonth(visibleMonth, offset)
    if (!availableMonths.includes(nextMonth)) return
    setVisibleMonth(nextMonth)
    setSelectedDate((prev) => (prev.startsWith(nextMonth) ? prev : getInitialDateForMonth(events, nextMonth)))
  }

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title="월간 일정" description="회비, 거래, 공지를 한 화면에서 확인합니다." />
        <View style={styles.monthRow}>
          <Pressable
            style={[styles.monthButton, disablePreviousMonth && styles.monthButtonDisabled]}
            onPress={() => handleChangeMonth(-1)}
            disabled={disablePreviousMonth}
            accessibilityRole="button"
            accessibilityLabel="이전 달 보기"
            accessibilityState={{ disabled: disablePreviousMonth }}
          >
            <Icon name="chevronLeft" size={16} color={disablePreviousMonth ? uiColors.textSoft : uiColors.textStrong} />
          </Pressable>
          <Text style={styles.monthLabel}>{getMonthLabel(visibleMonth)}</Text>
          <Pressable
            style={[styles.monthButton, disableNextMonth && styles.monthButtonDisabled]}
            onPress={() => handleChangeMonth(1)}
            disabled={disableNextMonth}
            accessibilityRole="button"
            accessibilityLabel="다음 달 보기"
            accessibilityState={{ disabled: disableNextMonth }}
          >
            <Icon name="chevronRight" size={16} color={disableNextMonth ? uiColors.textSoft : uiColors.textStrong} />
          </Pressable>
        </View>
        {visibleMonth !== initialMonth ? (
          <Button
            label="이번 달"
            variant="ghost"
            onPress={() => {
              setVisibleMonth(initialMonth)
              setSelectedDate(getInitialDateForMonth(events, initialMonth))
            }}
            style={styles.resetMonthButton}
          />
        ) : null}
        <View style={styles.grid}>
          {dates.map((date) => {
            const count = events.filter((event) => event.date === date).length
            const active = selectedDate === date
            return (
              <Pressable
                key={date}
                style={[styles.dayCell, count > 0 && styles.dayCellActive, active && styles.dayCellSelected]}
                onPress={() => setSelectedDate(date)}
                accessibilityRole="button"
                accessibilityLabel={`${date} 일정 보기`}
              >
                <Text style={[styles.dayLabel, count > 0 && styles.dayLabelActive]}>{Number(date.slice(-2))}</Text>
                <View accessibilityLabel={`${date} 일정 수 ${count}건`} style={styles.eventCountSlot}>
                  <Text style={[styles.eventCount, count === 0 && styles.eventCountPlaceholder]}>{count > 0 ? count : "0"}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="선택한 날짜 일정" />
        <Text style={styles.selectedDateHeading}>{formatDate(selectedDate)} 일정</Text>
        <Text style={styles.selectedDateLabel}>{formatDate(selectedDate)}</Text>
        <Text style={styles.selectedCountLabel}>선택 일정 {focusedEvents.length}건</Text>
        {focusedEvents.length > 0 ? (
          <View style={styles.list}>
            {focusedEvents.map((event) => {
              const toneStyle = getToneStyles(event.tone)

              return (
                <Pressable key={event.id} style={[styles.eventCard, compact && styles.eventCardCompact]}>
                  <Text
                    style={[
                      styles.eventTone,
                      {
                        borderColor: toneStyle.borderColor,
                        backgroundColor: toneStyle.backgroundColor,
                        color: toneStyle.color,
                      },
                    ]}
                  >
                    {getToneLabel(event.tone)}
                  </Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventMeta}>{formatDate(event.date)}</Text>
                </Pressable>
              )
            })}
          </View>
        ) : (
          <EmptyStateCard title="선택한 날짜 일정이 없습니다." description="다른 날짜를 눌러 일정을 확인해보세요." />
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="일정 추가 바로가기" description="필요한 화면으로 이동합니다." />
        <View style={styles.quickActionRow}>
          <Button
            label="회비 일정"
            variant="secondary"
            onPress={() => onOpenQuickAction?.("dues")}
            accessibilityLabel="회비 일정 열기"
            style={styles.quickActionButton}
          />
          <Button
            label="거래 일정"
            variant="ghost"
            onPress={() => onOpenQuickAction?.("transactions")}
            accessibilityLabel="거래 일정 열기"
            style={styles.quickActionButton}
          />
          <Button
            label="공지 일정"
            variant="ghost"
            onPress={() => onOpenQuickAction?.("board")}
            accessibilityLabel="공지 일정 열기"
            style={styles.quickActionButton}
          />
        </View>
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  monthButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonDisabled: {
    backgroundColor: uiColors.surfaceMuted,
    borderColor: uiColors.border,
    opacity: 0.45,
  },
  monthLabel: {
    color: uiColors.textStrong,
    fontSize: 15,
    fontWeight: "800",
  },
  resetMonthButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  quickActionButton: {
    minWidth: 104,
  },
  dayCell: {
    width: "12.5%",
    minWidth: 38,
    minHeight: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayCellActive: {
    backgroundColor: uiColors.primarySoft,
    borderColor: uiColors.primaryBorder,
  },
  dayCellSelected: {
    borderColor: uiColors.primary,
    borderWidth: 2,
  },
  dayLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  dayLabelActive: {
    color: uiColors.primary,
  },
  eventCountSlot: {
    minHeight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  eventCount: {
    color: uiColors.textStrong,
    fontSize: 11,
    fontWeight: "700",
  },
  eventCountPlaceholder: {
    opacity: 0,
  },
  list: {
    gap: 10,
    marginTop: 10,
  },
  selectedDateLabel: {
    marginTop: 4,
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  selectedDateHeading: {
    marginTop: 10,
    color: uiColors.textStrong,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  selectedCountLabel: {
    marginTop: 4,
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    padding: 14,
    gap: 4,
  },
  eventCardCompact: {
    padding: 12,
  },
  eventTone: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    color: uiColors.primary,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  eventTitle: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
  eventMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
})
