import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateEmail, validatePassword } from "@shared/lib/validation"
import { Card, SkeletonBlock, uiSpacing } from "@shared/ui"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"

const TEST_EMAIL = "test@test.com"
const TEST_PASSWORD = "password"

export function LoginScreen() {
  const { isBootstrapping, login, signup } = useApp()
  const { showError } = useFeedback()

  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState(TEST_EMAIL)
  const [password, setPassword] = useState(TEST_PASSWORD)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  async function handleSubmit() {
    if (submitting) return
    setError("")

    if (isSignup) {
      const validationError =
        requireText(name, "이름을 입력해주세요.") ??
        validateEmail(email) ??
        validatePassword(password)
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

    const validationError =
      validateEmail(email) ??
      requireText(password, "비밀번호를 입력해주세요.")
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
    setEmail(nextSignup ? "" : TEST_EMAIL)
    setPassword(nextSignup ? "" : TEST_PASSWORD)
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {isBootstrapping ? (
        <>
          <Card style={styles.loadingHeroCard}>
            <SkeletonBlock width="32%" height={12} />
            <SkeletonBlock width="54%" height={28} />
            <SkeletonBlock width="76%" height={14} />
            <SkeletonBlock width="68%" height={14} />
          </Card>
          <Card style={styles.loadingFormCard}>
            <SkeletonBlock width="28%" height={24} />
            <SkeletonBlock width="100%" height={48} />
            <SkeletonBlock width="100%" height={48} />
            <SkeletonBlock width="100%" height={52} />
          </Card>
        </>
      ) : (
        <>
          <AuthHero />
          <AuthFormCard
            isSignup={isSignup}
            name={name}
            email={email}
            password={password}
            error={error}
            onChangeName={setName}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onSubmit={handleSubmit}
            onToggleMode={() => resetForm(!isSignup)}
            submitting={submitting}
          />
        </>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: "#ffffff",
  },
  loadingHeroCard: {
    gap: uiSpacing.sm,
    marginBottom: uiSpacing.lg,
  },
  loadingFormCard: {
    gap: uiSpacing.md,
  },
})
