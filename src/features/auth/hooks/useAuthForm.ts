import { useState } from "react"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateEmail, validatePassword } from "@shared/lib/validation"
import { TEST_ACCOUNT } from "@shared/constants/copy"

interface UseAuthFormParams {
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  showError: (message: string, title?: string) => void
}

export function useAuthForm({ login, signup, showError }: UseAuthFormParams) {
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState<string>(TEST_ACCOUNT.email)
  const [password, setPassword] = useState<string>(TEST_ACCOUNT.password)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

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
      await new Promise((resolve) => setTimeout(resolve, 300))
      const ok = await signup(name.trim(), email.trim(), password)
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
    await new Promise((resolve) => setTimeout(resolve, 300))
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
    setEmail(nextSignup ? "" : TEST_ACCOUNT.email)
    setPassword(nextSignup ? "" : TEST_ACCOUNT.password)
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
