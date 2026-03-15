export function formatKRW(amount: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  return `${year}년 ${parseInt(m, 10)}월`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

export function formatActivityTimestamp(dateStr: string, now = Date.now()): string {
  const target = new Date(dateStr).getTime()
  const diffSeconds = Math.max(0, Math.floor((now - target) / 1000))

  if (diffSeconds < 60) return `${diffSeconds}초 전`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  return formatDateTime(dateStr)
}
