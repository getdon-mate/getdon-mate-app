import { Pressable, StyleSheet, Text, View } from "react-native"
import { COPY } from "@shared/constants/copy"
import { Button, Card, InputField, uiColors } from "@shared/ui"

interface AuthFormCardProps {
    isSignup: boolean
    name: string
    email: string
    password: string
    error: string
    nameError?: string
    emailError?: string
    passwordError?: string
    onChangeName: (value: string) => void
    onChangeEmail: (value: string) => void
    onChangePassword: (value: string) => void
    onSubmit: () => void
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
    nameError,
    emailError,
    passwordError,
    onChangeName,
    onChangeEmail,
    onChangePassword,
    onSubmit,
    onContinueAsGuest,
    onToggleMode,
    submitting = false,
    showTestAccountHint = false,
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
                    error={nameError}
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
                error={emailError}
            />

            <InputField
                value={password}
                onChangeText={onChangePassword}
                placeholder="비밀번호를 입력해주세요"
                secureTextEntry
                editable={!submitting}
                label="비밀번호"
                error={passwordError}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
                label={submitting ? "처리 중..." : isSignup ? "가입하기" : "로그인"}
                onPress={onSubmit}
                disabled={submitting}
                size="lg"
            />

            {!isSignup ? (
                <View style={styles.guestSection}>
                    <Text style={styles.guestHint}>계정 없이 앱을 먼저 둘러볼 수 있습니다.</Text>
                    <Button
                        label="게스트로 둘러보기"
                        variant="secondary"
                        onPress={onContinueAsGuest}
                        disabled={submitting}
                    />
                </View>
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
    guestSection: {
        gap: 6,
    },
    guestHint: {
        textAlign: "center",
        color: uiColors.textMuted,
        fontSize: 12,
    },
})
