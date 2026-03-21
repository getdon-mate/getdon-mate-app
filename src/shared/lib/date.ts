export function getCurrentMonthKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * 현재 달 기준으로 과거 N개월 + 다음 1개월을 포함한 월 목록을 반환합니다.
 * 최신 월이 배열 앞에 옵니다 (내림차순).
 */
export function getAvailableMonths(pastMonths = 11, date = new Date()): string[] {
  const months: string[] = []
  // 다음 달
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  months.push(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`)
  // 현재 달 포함 과거 N개월
  for (let i = 0; i <= pastMonths; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return months
}

export function getNextTransferDate(dayOfMonth: number): string {
  const now = new Date()
  const target = new Date(now)
  target.setDate(Math.min(dayOfMonth, 28))
  if (target.getTime() < now.getTime()) {
    target.setMonth(target.getMonth() + 1)
  }
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`
}

