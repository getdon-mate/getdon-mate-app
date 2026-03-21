import { StyleSheet, View } from "react-native"
import { useAppAccounts } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { feedbackPresets } from "@shared/lib/feedback-presets"
import { Button, uiColors } from "@shared/ui"
import type { GroupAccount } from "../../model/types"

export function DangerZonePanel({ account }: { account: GroupAccount }) {
  const { deleteAccount } = useAppAccounts()
  const { showToast, confirmDanger } = useFeedback()

  async function handleDeleteAccount() {
    const confirmed = await confirmDanger({
      title: feedbackPresets.deleteAccount.title,
      message: feedbackPresets.deleteAccount.message,
      confirmLabel: feedbackPresets.deleteAccount.confirmLabel,
    })
    if (!confirmed) return
    await deleteAccount(account.id)
    showToast({ tone: "success", title: feedbackPresets.deleteAccount.successTitle, message: feedbackPresets.deleteAccount.successMessage })
  }

  return (
    <View style={styles.container}>
      <Button variant="danger" label="이 모임통장 삭제" onPress={() => void handleDeleteAccount()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
    paddingVertical: 14,
  },
})
