import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { appEnv } from "@shared/config/app-env"
import { Button, Card, SkeletonBlock, StatusBanner, uiSpacing } from "@shared/ui"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"
import { useAuthForm } from "../hooks/useAuthForm"

export function LoginScreen() {
  const { isBootstrapping, isRefreshingAccounts, dataSource, prefersRealApi, lastSyncError, refreshAccounts, login, signup } = useApp()
  const { showError, showToast } = useFeedback()
  const { width } = useWindowDimensions()
  const isWide = width >= 900
  const { isSignup, name, email, password, error, submitting, setName, setEmail, setPassword, handleSubmit, resetForm } =
    useAuthForm({ login, signup, showError })

  async function handleRetryConnection() {
    const source = await refreshAccounts()
    showToast({
      tone: source === "remote" ? "success" : "warning",
      title: source === "remote" ? "연결 재시도 성공" : "연결 재시도 실패",
      message:
        source === "remote"
          ? "백엔드 연결이 복구되었습니다."
          : lastSyncError ?? "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
    })
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
            <StatusBanner
              title={dataSource === "remote" ? "실 API 연결 모드" : prefersRealApi ? "데모 데이터로 대체됨" : "데모 모드"}
              message={
                dataSource === "remote"
                  ? "백엔드 응답을 기준으로 세션과 계좌 정보를 복원합니다."
                  : prefersRealApi
                    ? (lastSyncError ?? "실 API를 사용하지 못해 로컬 데모 데이터로 앱이 동작합니다.")
                    : "실 API를 사용하지 못해 로컬 데모 데이터로 앱이 동작합니다."
              }
              tone={dataSource === "remote" ? "info" : "warning"}
              showMessage
            />
            {prefersRealApi && dataSource !== "remote" ? (
              <Button
                label={isRefreshingAccounts ? "재시도 중..." : "연결 재시도"}
                variant="ghost"
                onPress={() => void handleRetryConnection()}
                disabled={isRefreshingAccounts}
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
