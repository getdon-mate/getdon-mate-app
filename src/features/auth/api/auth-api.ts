import { apiClient } from "@core/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  userName: string
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function loginWithApi(req: LoginRequest): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/api/member/login", req)
}

export async function signupWithApi(req: SignupRequest): Promise<void> {
  return apiClient.post<void>("/api/member/join", req)
}

export async function refreshTokenWithApi(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/api/token/refresh", { refreshToken })
}
