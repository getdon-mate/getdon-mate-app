import { apiClient } from "@core/api"

interface SwaggerLoginRequest {
  email: string
  password: string
}

interface SwaggerJoinRequest extends SwaggerLoginRequest {
  userName: string
}

interface SwaggerCreateMeetingRequest {
  title: string
  bankName: string
  bankAccount: string
}

interface SwaggerLoginResponse {
  accessToken: string
  refreshToken: string
}

export interface SwaggerMeetingSummary {
  meetingId: number
  title: string
  bankName: string
  amount: number
  paidCount: number
}

function withAuthHeaders(accessToken: string) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export async function loginWithSwaggerApi(payload: SwaggerLoginRequest) {
  return apiClient.post<SwaggerLoginResponse>("/api/member/login", payload)
}

export async function signupWithSwaggerApi(payload: SwaggerJoinRequest) {
  return apiClient.post<null>("/api/member/join", payload)
}

export async function fetchMyMeetings(accessToken: string) {
  return apiClient.get<SwaggerMeetingSummary[]>("/api/meeting/my-list", withAuthHeaders(accessToken))
}

export async function createMeetingWithSwaggerApi(accessToken: string, payload: SwaggerCreateMeetingRequest) {
  return apiClient.post<null>("/api/meeting/create", payload, withAuthHeaders(accessToken))
}
