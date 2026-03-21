import { useMutation } from "@tanstack/react-query"
import { loginWithApi, signupWithApi, type LoginRequest, type SignupRequest } from "./auth-api"

export function useLoginMutation() {
  return useMutation({
    mutationFn: (req: LoginRequest) => loginWithApi(req),
  })
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (req: SignupRequest) => signupWithApi(req),
  })
}
