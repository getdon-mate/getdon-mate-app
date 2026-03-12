import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { requireText, validateEmail } from "@shared/lib/validation"
import { Button, Card, Icon, InputField, PageHeader, uiColors } from "@shared/ui"

export function MyPageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser, updateProfile } = useAppAuth()
  const { showError, showToast } = useFeedback()

  const [name, setName] = useState(currentUser?.name ?? "")
  const [email, setEmail] = useState(currentUser?.email ?? "")
  const { width } = useWindowDimensions()
  const isWide = width >= 960

  async function handleSave() {
    const validationError =
      requireText(name, "이름을 입력해주세요.") ??
      validateEmail(email)
    if (validationError) {
      showError(validationError)
      return
    }

    await updateProfile({
      name: name.trim(),
      email: email.trim(),
    })
    showToast({ tone: "success", title: "저장 완료", message: "마이페이지 정보를 수정했습니다." })
    navigation.navigate(ROUTES.AccountDetail)
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="이전 화면으로 이동">
            <Icon name="chevronLeft" size={20} color={uiColors.text} />
          </Pressable>
          <PageHeader title="마이페이지" subtitle="설정에서 들어오는 본인 정보 조회/수정 화면입니다." />

          <Card style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{(name || currentUser?.name || "나").slice(0, 1)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name ?? "사용자"}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email ?? "email@example.com"}</Text>
            </View>
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            <InputField value={name} onChangeText={setName} label="이름" placeholder="이름" />
            <InputField value={email} onChangeText={setEmail} label="이메일" placeholder="email@example.com" autoCapitalize="none" />
            <Button label="저장" onPress={() => void handleSave()} />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  contentWrap: {
    gap: 16,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e7f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#2563eb",
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  profileEmail: {
    color: "#6b7280",
    fontSize: 13,
  },
  formCard: {
    gap: 12,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
})
