import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "@core/navigation/types"
import { useApp } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { COPY } from "@shared/constants/copy"
import { Button, Card, PageHeader, ToggleSwitch, uiColors, uiSpacing } from "@shared/ui"

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
  const { notificationPreferences, updateNotificationPreferences } = useApp()
  const { showToast } = useFeedback()

  const [draft, setDraft] = useState(notificationPreferences)

  async function handleSave() {
    await updateNotificationPreferences(draft)
    showToast({ tone: "success", title: "저장 완료", message: COPY.notification.saved })
    navigation.goBack()
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title={COPY.notification.title} subtitle={COPY.notification.subtitle} />
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
        <Button label="취소" variant="ghost" onPress={() => navigation.goBack()} style={styles.actionButton} />
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
