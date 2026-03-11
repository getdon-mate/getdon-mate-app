import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

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
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{isSignup ? "회원가입" : "로그인"}</Text>

      {isSignup && (
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>이름</Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="실명을 입력해주세요"
            style={styles.input}
            autoCapitalize="none"
            editable={!submitting}
          />
        </View>
      )}

      <View style={styles.inputBlock}>
        <Text style={styles.inputLabel}>이메일</Text>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          placeholder="example@email.com"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!submitting}
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.inputLabel}>비밀번호</Text>
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          placeholder="비밀번호를 입력해주세요"
          style={styles.input}
          secureTextEntry
          editable={!submitting}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>
          {submitting ? "처리 중..." : isSignup ? "가입하기" : "로그인"}
        </Text>
      </Pressable>

      <Pressable onPress={onToggleMode} disabled={submitting}>
        <Text style={styles.switchText}>
          {isSignup ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
        </Text>
      </Pressable>

      {!isSignup && (
        <Text style={styles.helper}>테스트 계정: test@test.com / password</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "#edf0f4",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  inputBlock: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    paddingHorizontal: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
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
    color: "#64748b",
    fontSize: 12,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
  },
})
