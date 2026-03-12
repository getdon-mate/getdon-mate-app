import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { Card, SkeletonBlock, Toast, uiSpacing } from "@shared/ui"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"

const TEST_EMAIL = "test@test.com"
const TEST_PASSWORD = "password"

export function LoginScreen() {
  const { isBootstrapping, login, signup } = useApp()

  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState(TEST_EMAIL)
  const [password, setPassword] = useState(TEST_PASSWORD)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastTitle, setToastTitle] = useState("")
  const [toastMessage, setToastMessage] = useState("")

  async function handleSubmit() {
    if (submitting) return
    setError("")

    if (isSignup) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("모든 항목을 입력해주세요.")
        setToastTitle("입력 오류")
        setToastMessage("모든 항목을 입력해주세요.")
        setToastVisible(true)
        return
      }
      if (password.length < 4) {
        setError("비밀번호는 4자 이상이어야 합니다.")
        setToastTitle("입력 오류")
        setToastMessage("비밀번호는 4자 이상이어야 합니다.")
        setToastVisible(true)
        return
      }
      setSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      const ok = await signup(name.trim(), email.trim(), password)
      if (!ok) {
        setError("이미 사용 중인 이메일입니다.")
        setToastTitle("회원가입 실패")
        setToastMessage("이미 사용 중인 이메일입니다.")
        setToastVisible(true)
      }
      setSubmitting(false)
      return
    }

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.")
      setToastTitle("입력 오류")
      setToastMessage("이메일과 비밀번호를 입력해주세요.")
      setToastVisible(true)
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    const ok = await login(email.trim(), password)
    if (!ok) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.")
      setToastTitle("로그인 실패")
      setToastMessage("이메일 또는 비밀번호가 올바르지 않습니다.")
      setToastVisible(true)
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
      <Toast
        visible={toastVisible}
        tone="danger"
        title={toastTitle}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
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
