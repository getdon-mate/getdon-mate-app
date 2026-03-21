import { apiClient } from "@core/api"

export { loginWithApi as loginWithSwaggerApi, signupWithApi as signupWithSwaggerApi, refreshTokenWithApi as refreshAccessToken } from "@features/auth/api/auth-api"

interface SwaggerCreateMeetingRequest {
  title: string
  bankName: string
  bankAccount: string
}

export interface SwaggerMeetingSummary {
  meetingId: number
  title: string
  bankName: string
  amount: number
  paidCount: number
  // 백엔드가 제공할 경우 사용되는 선택적 상세 필드
  bankAccount?: string
  dueDay?: number
  monthlyDues?: number
  memberCount?: number
}

export interface SwaggerMeetingDetail extends SwaggerMeetingSummary {
  bankAccount: string
  dueDay: number
  monthlyDues: number
  memberCount: number
}

function withAuthHeaders(accessToken: string) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export async function fetchMyMeetings(accessToken: string) {
  return apiClient.get<SwaggerMeetingSummary[]>("/api/meeting/my-list", withAuthHeaders(accessToken))
}

export async function createMeetingWithSwaggerApi(accessToken: string, payload: SwaggerCreateMeetingRequest) {
  return apiClient.post<null>("/api/meeting/create", payload, withAuthHeaders(accessToken))
}

export async function fetchMeetingDetail(accessToken: string, meetingId: number) {
  return apiClient.get<SwaggerMeetingDetail>(`/api/meeting/${meetingId}`, withAuthHeaders(accessToken))
}

