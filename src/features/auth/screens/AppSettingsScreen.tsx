import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { Card, Icon, PageHeader, uiColors, uiSpacing } from "@shared/ui"

function SettingsActionRow({
  label,
  icon,
  onPress,
  tone = "default",
}: {
  label: string
  icon: "user" | "bell" | "logout" | "trash"
  onPress: () => void
  tone?: "default" | "danger"
}) {
  return (
    <Pressable style={[styles.row, tone === "danger" && styles.rowDanger]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBadge, tone === "danger" && styles.iconBadgeDanger]}>
          <Icon name={icon} size={13} color={tone === "danger" ? uiColors.danger : uiColors.text} />
        </View>
        <Text style={[styles.rowLabel, tone === "danger" && styles.rowLabelDanger]}>{label}</Text>
      </View>
      <Icon name="chevronRight" size={18} color="#c5cad3" />
    </Pressable>
  )
}

export function AppSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentUser, logout, withdraw } = useAppAuth()
  const { confirm, confirmDanger, showToast } = useFeedback()

  async function handleLogout() {
    const confirmed = await confirm({
      title: feedbackPresets.logout.title,
      message: feedbackPresets.logout.message,
      confirmLabel: feedbackPresets.logout.confirmLabel,
    })
    if (!confirmed) return
    logout()
    showToast({
      tone: "success",
      title: feedbackPresets.logout.successTitle,
      message: feedbackPresets.logout.successMessage,
    })
  }

  async function handleWithdraw() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.withdraw.title,
      message: feedbackPresets.withdraw.message,
      confirmLabel: feedbackPresets.withdraw.confirmLabel,
    })
    if (!confirmed) return
    withdraw()
    showToast({
      tone: "success",
      title: feedbackPresets.withdraw.successTitle,
      message: feedbackPresets.withdraw.successMessage,
    })
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="앱 설정" subtitle="앱 전체 설정과 계정 액션을 관리합니다." />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>빠른 설정</Text>
        <SettingsActionRow label="마이페이지" icon="user" onPress={() => navigation.navigate(ROUTES.MyPage)} />
        <SettingsActionRow label="알림 설정" icon="bell" onPress={() => navigation.navigate(ROUTES.NotificationSettings)} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>계정</Text>
        <Text style={styles.accountSummary}>{currentUser?.name ?? "사용자"} · {currentUser?.email ?? "email@example.com"}</Text>
        <Text style={styles.sectionDescription}>
          로그아웃과 회원 탈퇴는 앱 전체 설정에서만 관리합니다.
        </Text>
        <View style={styles.dangerGroup}>
          <SettingsActionRow label="로그아웃" icon="logout" onPress={() => void handleLogout()} />
          <SettingsActionRow label="회원 탈퇴" icon="trash" onPress={() => void handleWithdraw()} tone="danger" />
        </View>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  content: {
    padding: uiSpacing.lg,
    gap: uiSpacing.lg,
  },
  card: {
    gap: uiSpacing.md,
  },
  sectionTitle: {
    color: uiColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionDescription: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  accountSummary: {
    color: uiColors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: 16,
    backgroundColor: uiColors.surface,
  },
  rowDanger: {
    borderColor: uiColors.dangerBorder,
    backgroundColor: uiColors.dangerSoft,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.background,
  },
  iconBadgeDanger: {
    backgroundColor: "#ffffff",
  },
  rowLabel: {
    color: uiColors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  rowLabelDanger: {
    color: uiColors.danger,
  },
  dangerGroup: {
    gap: uiSpacing.sm,
  },
})
