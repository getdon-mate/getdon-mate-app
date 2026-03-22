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
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [nameError, setNameError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // 실서버 에러 메시지가 도착하면 폼 에러로 표시
  useEffect(() => {
    if (lastSyncError) setError(lastSyncError)
  }, [lastSyncError])

  async function handleSubmit() {
    if (submitting) return
    setError("")
    setNameError("")
    setEmailError("")
    setPasswordError("")

    if (isSignup) {
      const nameErr = requireText(name, "이름을 입력해주세요.")
      const emailErr = !nameErr ? validateEmail(email) : null
      const passwordErr = !nameErr && !emailErr ? validatePassword(password) : null

      if (nameErr) { setNameError(nameErr); showError(nameErr, feedbackPresets.validationError.title); return }
      if (emailErr) { setEmailError(emailErr); showError(emailErr, feedbackPresets.validationError.title); return }
      if (passwordErr) { setPasswordError(passwordErr); showError(passwordErr, feedbackPresets.validationError.title); return }

      setSubmitting(true)
      const ok = await signup(name, email, password)
      if (!ok) {
        setError(feedbackPresets.signupFailed.message)
        showError(feedbackPresets.signupFailed.message, feedbackPresets.signupFailed.title)
      }
      setSubmitting(false)
      return
    }

    const emailErr = validateEmail(email)
    const passwordErr = !emailErr ? requireText(password, "비밀번호를 입력해주세요.") : null

    if (emailErr) { setEmailError(emailErr); showError(emailErr, feedbackPresets.validationError.title); return }
    if (passwordErr) { setPasswordError(passwordErr); showError(passwordErr, feedbackPresets.validationError.title); return }

    setSubmitting(true)
    const ok = await login(email.trim(), password.trim())
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
    setNameError("")
    setEmailError("")
    setPasswordError("")
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
    nameError,
    emailError,
    passwordError,
    submitting,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
    resetForm,
  }
}
