import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useApp } from "../../../core/providers/AppProvider"

export function LoginScreen() {
  const { login, signup } = useApp()

  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit() {
    setError("")

    if (isSignup) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("모든 항목을 입력해주세요.")
        return
      }
      if (password.length < 4) {
        setError("비밀번호는 4자 이상이어야 합니다.")
        return
      }
      const ok = signup(name.trim(), email.trim(), password)
      if (!ok) setError("이미 사용 중인 이메일입니다.")
      return
    }

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    const ok = login(email.trim(), password)
    if (!ok) setError("이메일 또는 비밀번호가 올바르지 않습니다.")
  }

  function resetForm(nextSignup: boolean) {
    setIsSignup(nextSignup)
    setError("")
    setName("")
    setEmail("")
    setPassword("")
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>모임통장</Text>
        <Text style={styles.heroSubtitle}>우리 모임의 스마트한 회비 관리</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isSignup ? "회원가입" : "로그인"}</Text>

        {isSignup && (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름"
            style={styles.input}
            autoCapitalize="none"
          />
        )}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          style={styles.input}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{isSignup ? "가입하기" : "로그인"}</Text>
        </Pressable>

        <Pressable onPress={() => resetForm(!isSignup)}>
          <Text style={styles.switchText}>
            {isSignup ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
          </Text>
        </Pressable>

        {!isSignup && (
          <Text style={styles.helper}>테스트 계정: test@test.com / password</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#f5f7fb",
  },
  hero: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#dbeafe",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 2,
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
