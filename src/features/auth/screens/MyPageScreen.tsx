import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText, validateEmail } from "@shared/lib/validation"
import { Badge, Button, Card, Icon, InputField, PageHeader, uiColors, uiRadius, uiSpacing } from "@shared/ui"

export function MyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser, updateProfile } = useAppAuth()
  const { showError, showToast } = useFeedback()

  const [name, setName] = useState(currentUser?.name ?? "")
  const [email, setEmail] = useState(currentUser?.email ?? "")
  const [saving, setSaving] = useState(false)
  const { width } = useWindowDimensions()
  const isWide = width >= 960

  async function handleSave() {
    if (saving) return
    const validationError =
      requireText(name, "이름을 입력해주세요.") ??
      validateEmail(email)
    if (validationError) {
      showError(validationError)
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
      })
      showToast({ tone: "success", title: "저장 완료", message: "마이페이지 정보를 수정했습니다." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
            <Icon name="chevronLeft" size={20} color={uiColors.text} />
          </Pressable>
          <PageHeader title="마이페이지" subtitle="내 정보" />

          <Card style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(name || currentUser?.name || "나").slice(0, 1)}</Text>
              </View>
              <Badge label="My Account" tone="primary" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name ?? "사용자"}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email ?? "email@example.com"}</Text>
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

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            <InputField value={name} onChangeText={setName} label="이름" placeholder="이름" editable={!saving} />
            <InputField value={email} onChangeText={setEmail} label="이메일" placeholder="email@example.com" autoCapitalize="none" editable={!saving} />
            <View style={styles.actionRow}>
              <Button label={saving ? "저장 중..." : "저장"} onPress={() => void handleSave()} style={styles.actionButton} disabled={saving} />
            </View>
          </Card>
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
})
