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
import { Card, SkeletonBlock, uiSpacing } from "@shared/ui"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"
import { useAuthForm } from "../hooks/useAuthForm"

export function LoginScreen() {
  const { isBootstrapping } = useAppRuntime()
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
