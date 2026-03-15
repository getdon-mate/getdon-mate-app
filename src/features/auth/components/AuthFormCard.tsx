import { Pressable, StyleSheet, Text, View } from "react-native"
import { COPY } from "@shared/constants/copy"
import { Button, Card, Icon, InputField, uiColors } from "@shared/ui"

interface AuthFormCardProps {
  isSignup: boolean
  name: string
  email: string
  password: string
  error: string
  onChangeName: (value: string) => void
  onChangeEmail: (value: string) => void
  onChangePassword: (value: string) => void
  onSubmit: () => void
  onSocialLogin: (provider: "google" | "kakao") => void
  onContinueAsGuest: () => void
  onToggleMode: () => void
  submitting?: boolean
  showTestAccountHint?: boolean
}

export function AuthFormCard({
  isSignup,
  name,
  email,
  password,
  error,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onSocialLogin,
  onContinueAsGuest,
  onToggleMode,
  submitting = false,
  showTestAccountHint = false,
}: AuthFormCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>{isSignup ? "회원가입" : "로그인"}</Text>
      {!isSignup ? (
        <View style={styles.socialStack}>
          <Pressable style={styles.socialButton} onPress={() => onSocialLogin("google")} accessibilityRole="button" accessibilityLabel="Google로 계속하기">
            <Icon name="google" size={16} color={uiColors.textStrong} />
            <Text style={styles.socialButtonText}>Google로 계속하기</Text>
          </Pressable>
          <Pressable style={styles.socialButton} onPress={() => onSocialLogin("kakao")} accessibilityRole="button" accessibilityLabel="카카오로 계속하기">
            <Icon name="kakao" size={16} color={uiColors.textStrong} />
            <Text style={styles.socialButtonText}>카카오로 계속하기</Text>
          </Pressable>
        </View>
      ) : null}

      {isSignup && (
        <InputField
          value={name}
          onChangeText={onChangeName}
          placeholder="실명을 입력해주세요"
          autoCapitalize="none"
          editable={!submitting}
          label="이름"
        />
      )}

      <InputField
        value={email}
        onChangeText={onChangeEmail}
        placeholder="example@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!submitting}
        label="이메일"
      />

      <InputField
        value={password}
        onChangeText={onChangePassword}
        placeholder="비밀번호를 입력해주세요"
        secureTextEntry
        editable={!submitting}
        label="비밀번호"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={submitting ? "처리 중..." : isSignup ? "가입하기" : "로그인"}
        onPress={onSubmit}
        disabled={submitting}
        size="lg"
      />

      {!isSignup ? (
        <Button
          label="둘러보기"
          variant="ghost"
          onPress={onContinueAsGuest}
          disabled={submitting}
        />
      ) : null}

      <Pressable onPress={onToggleMode} disabled={submitting}>
        <Text style={styles.switchText}>
          {isSignup ? "이미 계정이 있나요? 로그인" : "처음이라면 회원가입"}
        </Text>
      </Pressable>

      {!isSignup && showTestAccountHint ? <Text style={styles.helper}>{COPY.auth.testAccountLabel}</Text> : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: uiColors.text,
    marginBottom: 4,
  },
  switchText: {
    textAlign: "center",
    marginTop: 4,
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  helper: {
    textAlign: "center",
    marginTop: 4,
    color: uiColors.textMuted,
    fontSize: 12,
  },
  error: {
    color: uiColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  socialStack: {
    gap: 10,
  },
  socialButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialButtonText: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
})
