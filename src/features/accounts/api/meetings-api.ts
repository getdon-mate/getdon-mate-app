import { apiClient } from "@core/api"

export interface SwaggerMeetingSummary {
  meetingId: number
  title: string
  bankName: string
  amount: number
  paidCount: number
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

export interface CreateMeetingRequest {
  title: string
  bankName: string
  bankAccount: string
}

function withAuthHeaders(accessToken: string) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export async function fetchMyMeetings(accessToken: string): Promise<SwaggerMeetingSummary[]> {
  return apiClient.get<SwaggerMeetingSummary[]>("/api/meeting/my-list", withAuthHeaders(accessToken))
}

export async function fetchMeetingDetail(
  accessToken: string,
  meetingId: number
): Promise<SwaggerMeetingDetail> {
  return apiClient.get<SwaggerMeetingDetail>(`/api/meeting/${meetingId}`, withAuthHeaders(accessToken))
}

export async function createMeeting(
  accessToken: string,
  req: CreateMeetingRequest
): Promise<null> {
  return apiClient.post<null>("/api/meeting/create", req, withAuthHeaders(accessToken))
}
