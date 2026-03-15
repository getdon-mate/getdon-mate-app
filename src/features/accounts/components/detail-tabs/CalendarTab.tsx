import { Pressable, StyleSheet, Text, View } from "react-native"
import { useEffect, useMemo, useState } from "react"
import { formatDate } from "@shared/lib/format"
import { uiColors } from "@shared/ui"
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

export function CalendarTab({ account }: { account: GroupAccount }) {
  const events = getCalendarEvents(account)
  const latestDate = events[events.length - 1]?.date ?? new Date().toISOString().slice(0, 10)
  const selectedMonth = latestDate.slice(0, 7)
  const dates = getDatesForMonth(selectedMonth)
  const [selectedDate, setSelectedDate] = useState(latestDate)

  useEffect(() => {
    setSelectedDate(latestDate)
  }, [latestDate])

  const focusedEvents = useMemo(() => getCalendarEventsForDate(events, selectedDate), [events, selectedDate])

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title="월간 일정" />
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
                {count > 0 ? <Text style={styles.eventCount}>{count}</Text> : null}
              </Pressable>
            )
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="선택한 날짜 일정" />
        {focusedEvents.length > 0 ? (
          <View style={styles.list}>
            {focusedEvents.map((event) => (
              <Pressable key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>{formatDate(event.date)}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyStateCard title="선택한 날짜의 일정이 없습니다." description="다른 날짜를 눌러 예정된 회비, 거래, 공지 일정을 확인해보세요." />
        )}
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  dayCell: {
    width: "12.5%",
    minWidth: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 8,
    alignItems: "center",
    gap: 4,
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
  eventCount: {
    color: uiColors.textStrong,
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    gap: 10,
    marginTop: 10,
  },
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    padding: 14,
    gap: 4,
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
