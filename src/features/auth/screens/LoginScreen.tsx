import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { AuthFormCard } from "../components/AuthFormCard"
import { AuthHero } from "../components/AuthHero"

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
        onToggleMode={() => resetForm(!isSignup)}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "#f4f5f7",
  },
})
