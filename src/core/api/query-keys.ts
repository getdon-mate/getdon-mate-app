/**
 * React Query 쿼리 키 팩토리
 *
 * 공식 권장 패턴: https://tkdodo.eu/blog/effective-react-query-keys
 * 쿼리 키를 중앙화하여 캐시 무효화 시 일관성을 보장합니다.
 */

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
} as const

export const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: (accessToken: string) => [...meetingKeys.lists(), { accessToken }] as const,
  details: () => [...meetingKeys.all, "detail"] as const,
  detail: (meetingId: string) => [...meetingKeys.details(), meetingId] as const,
} as const
