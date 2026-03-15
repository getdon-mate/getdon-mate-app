import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { useAppAuth, useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { appEnv } from "@shared/config/app-env"
import { TEST_ACCOUNT } from "@shared/constants/copy"
import { Card, SkeletonBlock, StatusBanner, uiSpacing } from "@shared/ui"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"
import { useAuthForm } from "../hooks/useAuthForm"

export function LoginScreen() {
  const { isBootstrapping, prefersRealApi, lastSyncError, authRecoveryNotice } = useAppRuntime()
  const { login, signup } = useAppAuth()
  const { showError, showToast } = useFeedback()
  const { width } = useWindowDimensions()
  const isWide = width >= 900
  const { isSignup, name, email, password, error, submitting, setName, setEmail, setPassword, handleSubmit, resetForm } =
    useAuthForm({ login, signup, showError })

  async function handleSocialLogin(provider: "google" | "kakao") {
    const ok = await login("test@test.com", "password")
    if (!ok) {
      showError("소셜 로그인 데모 계정에 연결하지 못했습니다.")
      return
    }
    showToast({ tone: "success", title: `${provider === "google" ? "Google" : "카카오"} 로그인`, message: "데모 계정으로 바로 이어집니다." })
  }

  async function handleContinueAsGuest() {
    const ok = await login(TEST_ACCOUNT.email, TEST_ACCOUNT.password)
    if (!ok) {
      showError("둘러보기를 시작하지 못했습니다. 잠시 후 다시 시도해주세요.")
      return
    }
    showToast({ tone: "success", title: "둘러보기 시작", message: "데모 계정으로 주요 화면을 바로 확인할 수 있습니다." })
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: undefined })}
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
              onContinueAsGuest={handleContinueAsGuest}
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
    backgroundColor: "#ffffff",
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
