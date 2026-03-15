import { formatActivityTimestamp } from "@shared/lib/format"

describe("formatActivityTimestamp", () => {
  test("shows relative time within 24 hours", () => {
    const now = new Date("2026-03-04T10:00:30.000Z").getTime()

    expect(formatActivityTimestamp("2026-03-04T10:00:10.000Z", now)).toBe("20초 전")
    expect(formatActivityTimestamp("2026-03-04T09:58:30.000Z", now)).toBe("2분 전")
    expect(formatActivityTimestamp("2026-03-04T08:00:30.000Z", now)).toBe("2시간 전")
  })

  test("shows full timestamp after 24 hours", () => {
    const now = new Date("2026-03-05T10:00:30.000Z").getTime()

    expect(formatActivityTimestamp("2026-03-04T08:00:30.000Z", now)).toBe("2026-03-04 08:00:30")
  })
})
