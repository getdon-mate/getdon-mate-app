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
}: AuthFormCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{isSignup ? "회원가입" : "로그인"}</Text>

      {isSignup && (
        <TextInput
          value={name}
          onChangeText={onChangeName}
          placeholder="이름"
          style={styles.input}
          autoCapitalize="none"
        />
      )}

      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        placeholder="이메일"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        value={password}
        onChangeText={onChangePassword}
        placeholder="비밀번호"
        style={styles.input}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.submitButton} onPress={onSubmit}>
        <Text style={styles.submitButtonText}>{isSignup ? "가입하기" : "로그인"}</Text>
      </Pressable>

      <Pressable onPress={onToggleMode}>
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
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7dce5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#f9fafb",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  switchText: {
    textAlign: "center",
    marginTop: 6,
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
