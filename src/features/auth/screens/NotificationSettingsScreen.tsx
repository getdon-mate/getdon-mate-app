import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useAppRuntime } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { COPY } from "@shared/constants/copy"
import { Badge, Button, Card, Icon, PageHeader, ToggleSwitch, uiColors, uiRadius, uiSpacing } from "@shared/ui"

function NotificationToggleRow({
  title,
  value,
  onToggle,
}: {
  title: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <View style={styles.row}>
      <View style={styles.titleInputWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <ToggleSwitch value={value} onPress={onToggle} accessibilityLabel={`${title} 토글`} />
    </View>
  )
}

export function NotificationSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { notificationPreferences, updateNotificationPreferences, defaultNotificationPreferences } = useAppRuntime()
  const { showToast, confirm } = useFeedback()

  const [draft, setDraft] = useState(notificationPreferences)
  const allowExitRef = useRef(false)
  const enabledCount = [draft.duesReminder, draft.transactionAlert, draft.noticeAlert].filter(Boolean).length
  const dirtyCount = Number(draft.duesReminder !== notificationPreferences.duesReminder)
    + Number(draft.transactionAlert !== notificationPreferences.transactionAlert)
    + Number(draft.noticeAlert !== notificationPreferences.noticeAlert)
  const isDirty = dirtyCount > 0

  useEffect(() => {
    setDraft(notificationPreferences)
  }, [notificationPreferences])

  const attemptExit = useCallback(async () => {
    if (!isDirty) {
      allowExitRef.current = true
      navigation.goBack()
      return
    }

    const confirmed = await confirm({
      title: "변경 내용 폐기",
      message: "저장하지 않은 알림 설정 변경이 있습니다. 이 화면을 나가면 변경 내용이 사라집니다.",
      confirmLabel: "나가기",
      cancelLabel: "계속 수정",
      confirmTone: "danger",
    })

    if (!confirmed) return

    setDraft(notificationPreferences)
    allowExitRef.current = true
    navigation.goBack()
  }, [confirm, isDirty, navigation, notificationPreferences])

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!isDirty || allowExitRef.current) {
        allowExitRef.current = false
        return
      }

      event.preventDefault()
      void attemptExit()
    })

    return unsubscribe
  }, [attemptExit, isDirty, navigation])

  async function handleSave() {
    await updateNotificationPreferences(draft)
    allowExitRef.current = true
    showToast({ tone: "success", title: "저장 완료", message: COPY.notification.saved })
    navigation.goBack()
  }

  function handleResetDefaults() {
    setDraft({ ...defaultNotificationPreferences })
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title={COPY.notification.title} subtitle={COPY.notification.subtitle} />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryIconBadge}>
            <Icon name="bell" size={18} color={uiColors.primary} />
          </View>
          <Badge label={`${enabledCount}/3 활성`} tone="primary" />
        </View>
        <Text style={styles.summaryTitle}>알림 상태 요약</Text>
        <Text style={styles.summaryBody}>
          회비 마감, 입출금, 공지 알림을 이 화면에서 관리합니다. 저장 전에는 현재 화면의 draft만 바뀝니다.
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>미저장 변경 {dirtyCount}건</Text>
          <Button label="기본값 복원" variant="ghost" onPress={handleResetDefaults} style={styles.resetButton} />
        </View>
      </Card>

      <Card style={styles.card}>
        <NotificationToggleRow
          title="회비 마감 알림"
          value={draft.duesReminder}
          onToggle={() => setDraft((prev) => ({ ...prev, duesReminder: !prev.duesReminder }))}
        />
        <NotificationToggleRow
          title="입출금 알림"
          value={draft.transactionAlert}
          onToggle={() => setDraft((prev) => ({ ...prev, transactionAlert: !prev.transactionAlert }))}
        />
        <NotificationToggleRow
          title="공지 알림"
          value={draft.noticeAlert}
          onToggle={() => setDraft((prev) => ({ ...prev, noticeAlert: !prev.noticeAlert }))}
        />
      </Card>

      <View style={styles.actions}>
        <Button label="취소" variant="ghost" onPress={() => void attemptExit()} style={styles.actionButton} />
        <Button label="저장" onPress={() => void handleSave()} style={styles.actionButton} />
      </View>
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
  summaryCard: {
    gap: uiSpacing.md,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
  },
  summaryTitle: {
    color: uiColors.textStrong,
    fontSize: 18,
    fontWeight: "700",
  },
  summaryBody: {
    color: uiColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.md,
    paddingTop: 2,
  },
  metaText: {
    color: uiColors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  resetButton: {
    minHeight: 36,
    minWidth: 110,
    borderRadius: uiRadius.full,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.md,
  },
  titleInputWrap: {
    flex: 1,
  },
  rowTitle: {
    color: uiColors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: uiSpacing.sm,
  },
  actionButton: {
    flex: 1,
  },
})
