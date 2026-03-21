import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  Alert,
} from "react-native"
import { useEffect } from "react"
import { useAppAuth, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { readLastEmail } from "@shared/lib/session-storage"
import { appEnv } from "@shared/config/app-env"
import { Card, SkeletonBlock, StatusBanner, uiSpacing } from "@shared/ui"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"
import { useAuthForm } from "../hooks/useAuthForm"

export function LoginScreen() {
  const { isBootstrapping, prefersRealApi, lastSyncError, authRecoveryNotice } = useAppRuntime()
  const { login, signup, continueAsGuest } = useAppAuth()
  const { showError } = useFeedback()
  const { width } = useWindowDimensions()
  const isWide = width >= 900
  const { isSignup, name, email, password, error, submitting, setName, setEmail, setPassword, handleSubmit, resetForm } =
    useAuthForm({ login, signup, showError, lastSyncError })

  useEffect(() => {
    const lastEmail = readLastEmail()
    if (lastEmail) {
      setEmail(lastEmail)
    }
  }, [])

  const handleSocialLogin = (provider: "google" | "kakao") => {
    Alert.alert(
      "준비 중",
      `${provider === "google" ? "Google" : "카카오"} 로그인 기능은 현재 준비 중입니다.`,
      [{ text: "확인" }]
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      <View style={[styles.content, isWide && styles.contentWide]}>
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
            {authRecoveryNotice ? (
              <StatusBanner
                title={authRecoveryNotice}
                message="이전 세션 대신 현재 상태를 다시 확인해 주세요."
                tone="warning"
                showMessage
              />
            ) : null}
            {prefersRealApi && lastSyncError ? (
              <StatusBanner
                title="실서버 연결이 불안정해 데모 데이터로 이어집니다."
                message={lastSyncError}
                tone="warning"
                showMessage
              />
            ) : null}
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
              onSocialLogin={handleSocialLogin}
              onContinueAsGuest={continueAsGuest}
              onToggleMode={() => resetForm(!isSignup)}
              submitting={submitting}
              showTestAccountHint={appEnv.showTestCredentials}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: uiColors.background,
  },
  content: {
    width: "100%",
    gap: uiSpacing.md,
  },
  contentWide: {
    alignSelf: "center",
    maxWidth: 560,
  },
  loadingHeroCard: {
    gap: uiSpacing.sm,
    marginBottom: uiSpacing.lg,
  },
  loadingFormCard: {
    gap: uiSpacing.md,
  },
})
