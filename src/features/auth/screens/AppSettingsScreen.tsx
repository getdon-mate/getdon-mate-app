import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { ROUTES } from "@core/navigation/routes"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { Badge, Card, Icon, PageHeader, uiColors, uiRadius, uiSpacing } from "@shared/ui"

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
      <PageHeader title="앱 설정" subtitle="앱 전체 설정과 계정 액션을 관리합니다." />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryBadge}>
            <Icon name="settings" size={18} color={uiColors.primary} />
          </View>
          <Badge label="Global" tone="primary" />
        </View>
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>앱 전체 관리</Text>
          <Text style={styles.summaryBody}>
            알림, 계정 관리, 로그아웃과 탈퇴 같은 전역 액션은 여기에서만 다룹니다.
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>빠른 설정</Text>
        <SettingsActionRow
          label="마이페이지"
          caption="이름과 이메일을 확인하고 수정합니다."
          icon="user"
          onPress={() => navigation.navigate(ROUTES.MyPage)}
        />
        <SettingsActionRow
          label="알림 설정"
          caption="중요 알림 수신 방식을 관리합니다."
          icon="bell"
          onPress={() => navigation.navigate(ROUTES.NotificationSettings)}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.accountStrip}>
          <View style={styles.accountAvatar}>
            <Text style={styles.accountAvatarText}>{(currentUser?.name ?? "사").slice(0, 1)}</Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountSummary}>{currentUser?.name ?? "사용자"}</Text>
            <Text style={styles.accountEmail}>{currentUser?.email ?? "email@example.com"}</Text>
          </View>
        </View>
        <Text style={styles.sectionDescription}>
          로그아웃과 회원 탈퇴는 앱 전체 설정에서만 관리합니다.
        </Text>
        <View style={styles.dangerGroup}>
          <SettingsActionRow
            label="로그아웃"
            caption="현재 기기에서 세션을 종료합니다."
            icon="logout"
            onPress={() => void handleLogout()}
          />
          <SettingsActionRow
            label="회원 탈퇴"
            caption="계정을 삭제하고 모든 세션을 종료합니다."
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
  summaryCard: {
    gap: uiSpacing.lg,
    backgroundColor: uiColors.surfaceMuted,
    borderColor: uiColors.borderStrong,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
  },
  summaryText: {
    gap: 8,
  },
  summaryTitle: {
    color: uiColors.textStrong,
    fontSize: 20,
    fontWeight: "700",
  },
  summaryBody: {
    color: uiColors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    color: uiColors.textStrong,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionDescription: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  accountStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.md,
    padding: uiSpacing.md,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
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
    minHeight: 72,
    flexDirection: "row",
    alignItems: "flex-start",
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
    alignItems: "flex-start",
    gap: uiSpacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    gap: 4,
  },
  rowLabel: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "600",
  },
  rowCaption: {
    color: uiColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  rowLabelDanger: {
    color: uiColors.danger,
  },
  dangerGroup: {
    gap: uiSpacing.sm,
  },
})
