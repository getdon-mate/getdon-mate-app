import { Pressable, StyleSheet, Text, View } from "react-native"
import { formatDate } from "@shared/lib/format"
import { uiColors } from "@shared/ui"
import { getCalendarEvents } from "../../model/selectors"
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
  const selectedMonth = events[events.length - 1]?.date.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
  const dates = getDatesForMonth(selectedMonth)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title="월간 일정" />
        <View style={styles.grid}>
          {dates.map((date) => {
            const count = events.filter((event) => event.date === date).length
            return (
              <View key={date} style={[styles.dayCell, count > 0 && styles.dayCellActive]}>
                <Text style={[styles.dayLabel, count > 0 && styles.dayLabelActive]}>{Number(date.slice(-2))}</Text>
                {count > 0 ? <Text style={styles.eventCount}>{count}</Text> : null}
              </View>
            )
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="예정/기록된 일정" />
        {events.length > 0 ? (
          <View style={styles.list}>
            {events.map((event) => (
              <Pressable key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>{formatDate(event.date)}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyStateCard title="등록된 일정이 없습니다." description="회비 마감일, 거래일, 공지 일정이 여기에 모입니다." />
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
