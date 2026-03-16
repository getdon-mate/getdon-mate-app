import { apiClient } from "@core/api"
import type { AppUser, GroupAccount } from "../model/types"

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
  bankAccount: number
}

interface SwaggerLoginResponse {
  accessToken: string
  refreshToken: string
}

interface SwaggerMeetingSummary {
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

function deriveInitials(name: string) {
  return name.trim().slice(-2) || "??"
}

export function createRemoteUser(email: string, name?: string): AppUser {
  const derivedName = name?.trim() || email.split("@")[0] || "사용자"

  return {
    id: `remote:${email}`,
    name: derivedName,
    email,
    password: "",
  }
}

export function toGroupAccountSummary(meeting: SwaggerMeetingSummary, currentUser: AppUser | null): GroupAccount {
  return {
    id: String(meeting.meetingId),
    groupName: meeting.title,
    bankName: meeting.bankName,
    accountNumber: "",
    balance: meeting.amount,
    monthlyDuesAmount: 0,
    dueDay: 25,
    members: currentUser
      ? [
          {
            id: `leader-${meeting.meetingId}`,
            userId: currentUser.id,
            name: currentUser.name,
            role: "총무",
            initials: deriveInitials(currentUser.name),
            phone: "",
            joinDate: new Date().toISOString().split("T")[0],
            color: "#3b82f6",
          },
        ]
      : [],
    duesRecords: [],
    transactions: [],
    autoTransfer: {
      enabled: false,
      dayOfMonth: 25,
      amount: 0,
      fromAccount: "",
    },
    oneTimeDues: [],
    reminders: [],
    boardPosts: [],
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
