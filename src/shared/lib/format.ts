export function formatKRW(amount: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  return `${year}년 ${parseInt(m, 10)}월`
}

/**
 * "YYYY-MM-DD" 형식의 날짜 문자열을 로컬 타임존 기준으로 파싱합니다.
 * new Date("YYYY-MM-DD")는 UTC 자정으로 파싱되어 KST(UTC+9)에서 하루 앞서 표시되는 문제를 방지합니다.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export function formatFullDate(dateStr: string): string {
  const date = parseLocalDate(dateStr)
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
