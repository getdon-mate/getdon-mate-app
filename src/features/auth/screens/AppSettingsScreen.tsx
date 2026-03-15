import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { Card, Icon, PageHeader, uiColors, uiRadius, uiSpacing } from "@shared/ui"

function SettingsActionRow({
  label,
  caption,
  icon,
  onPress,
  tone = "default",
}: {
  label: string
  caption?: string
  icon: "user" | "bell" | "logout" | "trash"
  onPress: () => void
  tone?: "default" | "danger"
}) {
  return (
    <Pressable style={[styles.row, tone === "danger" && styles.rowDanger]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBadge, tone === "danger" && styles.iconBadgeDanger]}>
          <Icon name={icon} size={14} color={tone === "danger" ? uiColors.danger : uiColors.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, tone === "danger" && styles.rowLabelDanger]}>{label}</Text>
          {caption ? <Text style={styles.rowCaption}>{caption}</Text> : null}
        </View>
      </View>
      <Icon name="chevronRight" size={18} color={uiColors.textSoft} />
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
      <PageHeader title="설정" />

      <Card style={styles.card}>
        <View style={styles.accountStrip}>
          <View style={styles.accountAvatar}>
            <Text style={styles.accountAvatarText}>{(currentUser?.name ?? "사").slice(0, 1)}</Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountSummary}>{currentUser?.name ?? "사용자"}</Text>
            <Text style={styles.accountEmail}>{currentUser?.email ?? "email@example.com"}</Text>
          </View>
        </View>
        <SettingsActionRow
          label="마이페이지"
          caption="이름과 이메일"
          icon="user"
          onPress={() => navigation.navigate(ROUTES.MyPage)}
        />
        <SettingsActionRow
          label="알림 설정"
          caption="알림 방식"
          icon="bell"
          onPress={() => navigation.navigate(ROUTES.NotificationSettings)}
        />
      </Card>

      <Card style={styles.card}>
        <View style={styles.dangerGroup}>
          <SettingsActionRow
            label="로그아웃"
            caption="이 기기에서 로그아웃"
            icon="logout"
            onPress={() => void handleLogout()}
          />
          <SettingsActionRow
            label="회원 탈퇴"
            caption="계정 삭제"
            icon="trash"
            onPress={() => void handleWithdraw()}
            tone="danger"
          />
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
    borderRadius: uiRadius.xxl,
  },
  accountStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.md,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  accountAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
  },
  accountAvatarText: {
    color: uiColors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  accountText: {
    gap: 2,
  },
  accountSummary: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "600",
  },
  accountEmail: {
    color: uiColors.textMuted,
    fontSize: 13,
  },
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.lg,
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
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
  },
  iconBadgeDanger: {
    backgroundColor: uiColors.surface,
    borderColor: uiColors.dangerBorder,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "600",
  },
  rowCaption: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  rowLabelDanger: {
    color: uiColors.danger,
  },
  dangerGroup: {
    gap: uiSpacing.sm,
  },
})
