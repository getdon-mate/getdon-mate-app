import { Pressable, StyleSheet, Text, View } from "react-native"
import { Button, Card, InputField, uiColors } from "@shared/ui"

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
  onToggleMode: () => void
  submitting?: boolean
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
  onToggleMode,
  submitting = false,
}: AuthFormCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>{isSignup ? "회원가입" : "로그인"}</Text>

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

      <Pressable onPress={onToggleMode} disabled={submitting}>
        <Text style={styles.switchText}>
          {isSignup ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
        </Text>
      </Pressable>

      {!isSignup && (
        <Text style={styles.helper}>테스트 계정: test@test.com / password</Text>
      )}
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
    color: "#111827",
    marginBottom: 4,
  },
  switchText: {
    textAlign: "center",
    marginTop: 4,
    color: "#2563eb",
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
})
