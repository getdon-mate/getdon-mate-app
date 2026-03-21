import { useEffect, useState } from "react"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateEmail, validatePassword } from "@shared/lib/validation"
import { COPY } from "@shared/constants/copy"

interface UseAuthFormParams {
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  showError: (message: string, title?: string) => void
  lastSyncError?: string | null
}

export function useAuthForm({ login, signup, showError, lastSyncError }: UseAuthFormParams) {
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // 실서버 에러 메시지가 도착하면 폼 에러로 표시
  useEffect(() => {
    if (lastSyncError) setError(lastSyncError)
  }, [lastSyncError])

  async function handleSubmit() {
    if (submitting) return
    setError("")

    if (isSignup) {
      const validationError = requireText(name, "이름을 입력해주세요.") ?? validateEmail(email) ?? validatePassword(password)
      if (validationError) {
        setError(validationError)
        showError(validationError, feedbackPresets.validationError.title)
        return
      }
      setSubmitting(true)
      const ok = await signup(name, email, password)
      if (!ok) {
        setError(feedbackPresets.signupFailed.message)
        showError(feedbackPresets.signupFailed.message, feedbackPresets.signupFailed.title)
      }
      setSubmitting(false)
      return
    }

    const validationError = validateEmail(email) ?? requireText(password, "비밀번호를 입력해주세요.")
    if (validationError) {
      setError(validationError)
      showError(validationError, feedbackPresets.validationError.title)
      return
    }

    setSubmitting(true)
    const ok = await login(email.trim(), password)
    if (!ok) {
      setError(feedbackPresets.loginFailed.message)
      showError(feedbackPresets.loginFailed.message, feedbackPresets.loginFailed.title)
    }
    setSubmitting(false)
  }

  function resetForm(nextSignup: boolean) {
    if (submitting) return
    setIsSignup(nextSignup)
    setError("")
    setName("")
    // NOTE: We don't reset email if it already exists to improve UX (especially when switching back from signup)
    if (nextSignup) {
      setEmail("")
    }
    setPassword("")
  }

  return {
    isSignup,
    name,
    email,
    password,
    error,
    submitting,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
    resetForm,
  }
}
