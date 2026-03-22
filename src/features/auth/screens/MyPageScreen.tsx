import { useRef, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { requireText, validateEmail } from "@shared/lib/validation"
import { Badge, Button, Card, Icon, InputField, PageHeader, uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { COPY } from "@shared/constants/copy"

export function MyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser, updateProfile, withdraw, logout } = useAppAuth()
  const isGuest = currentUser?.isGuest === true
  const { showToast, confirmDanger, showAlert } = useFeedback()

  const [name, setName] = useState(currentUser?.name ?? "")
  const [email, setEmail] = useState(currentUser?.email ?? "")
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const { width } = useWindowDimensions()
  const isWide = width >= 960

  async function handleSave() {
    if (savingRef.current) return

    setNameError("")
    setEmailError("")

    const nErr = requireText(name, "이름을 입력해주세요.")
    const eErr = validateEmail(email)

    if (nErr) setNameError(nErr)
    if (eErr) setEmailError(eErr)

    if (nErr || eErr) return

    savingRef.current = true
    setSaving(true)
    try {
      await updateProfile({ name: name.trim(), email: email.trim() })
      showToast(feedbackPresets.profileSaved)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  async function handleLogout() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.logout.title,
      message: feedbackPresets.logout.message,
      confirmLabel: feedbackPresets.logout.confirmLabel,
    })
    if (!confirmed) return
    logout()
  }

  async function handleWithdraw() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.withdraw.title,
      message: feedbackPresets.withdraw.message,
      confirmLabel: feedbackPresets.withdraw.confirmLabel,
    })
    if (!confirmed) return
    try {
      await withdraw()
    } catch {
      showAlert({ title: "탈퇴 실패", message: "탈퇴를 처리하는 중 오류가 발생했습니다.", tone: "danger" })
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: "padding", android: "height" })}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
            <Icon name="chevronLeft" size={20} color={uiColors.text} />
          </Pressable>
          <PageHeader title="마이페이지" subtitle="내 정보" />

          <Card style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(name.trim() || currentUser?.name || "나").slice(0, 1)}</Text>
              </View>
              <Badge label="내 계정" tone="primary" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name ?? "사용자"}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email || "이메일 미설정"}</Text>
              <Text style={styles.profileHint}>이름과 이메일을 정리할 수 있습니다.</Text>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>상태</Text>
                <Text style={styles.summaryValue}>정상</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>알림</Text>
                <Text style={styles.summaryValue}>켜짐</Text>
              </View>
            </View>
          </Card>

          {isGuest ? (
            <Card style={styles.formCard}>
              <Text style={styles.guestNotice}>게스트 모드에서는 정보 변경이 제한됩니다.</Text>
              <Button label="로그인 / 회원가입" onPress={logout} />
            </Card>
          ) : (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>기본 정보</Text>
              <InputField value={name} onChangeText={setName} label="이름" placeholder="이름" editable={!saving} error={nameError} />
              <InputField value={email} onChangeText={setEmail} label="이메일" placeholder="이메일" autoCapitalize="none" editable={!saving} error={emailError} />
              <View style={styles.actionRow}>
                <Button label={saving ? COPY.common.saving : COPY.common.save} onPress={() => void handleSave()} style={styles.actionButton} disabled={saving} />
              </View>
              <View style={styles.accountActionsRow}>
                <Button
                  label="로그아웃"
                  variant="ghost"
                  onPress={() => void handleLogout()}
                  style={styles.accountActionButton}
                  disabled={saving}
                />
                <Button
                  label="회원 탈퇴"
                  variant="ghost"
                  onPress={() => void handleWithdraw()}
                  style={styles.accountActionButton}
                  disabled={saving}
                />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  content: {
    paddingHorizontal: uiSpacing.lg,
    paddingTop: uiSpacing.lg,
    paddingBottom: uiSpacing.xxl,
  },
  contentWrap: {
    gap: uiSpacing.lg,
  },
  contentWrapWide: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 920,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  profileCard: {
    gap: uiSpacing.lg,
    backgroundColor: uiColors.surface,
    borderColor: uiColors.border,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: uiColors.primarySoft,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: uiColors.primary,
    fontSize: 28,
    fontWeight: "700",
  },
  profileInfo: {
    gap: 6,
  },
  profileName: {
    color: uiColors.textStrong,
    fontSize: 24,
    fontWeight: "700",
  },
  profileEmail: {
    color: uiColors.textMuted,
    fontSize: 14,
  },
  profileHint: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: uiSpacing.md,
  },
  summaryCard: {
    flex: 1,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.md,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    gap: 4,
  },
  summaryLabel: {
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValue: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  formCard: {
    gap: uiSpacing.md,
  },
  sectionTitle: {
    color: uiColors.textStrong,
    fontSize: 17,
    fontWeight: "700",
  },
  actionRow: {
    paddingTop: uiSpacing.xs,
  },
  actionButton: {
    minHeight: 50,
  },
  accountActionsRow: {
    flexDirection: "row",
    gap: uiSpacing.sm,
    paddingTop: uiSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  accountActionButton: {
    flex: 1,
  },
  guestNotice: {
    color: uiColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
})
