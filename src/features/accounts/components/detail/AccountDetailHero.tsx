import { Pressable, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius, uiSpacing } from "@shared/ui"
import type { GroupAccount, TransactionType } from "../../model/types"

export function AccountDetailHero({
  account,
  onPressAction,
}: {
  account: GroupAccount
  onPressAction: (type: TransactionType) => void
}) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroIdentityRow}>
        <Text style={styles.heroIcon}>{account.groupName.slice(0, 1)}</Text>
        <View style={styles.heroTitleWrap}>
          <Text style={styles.heroTitle}>{account.groupName}</Text>
          <Text style={styles.heroMeta}>모임원 {account.members.length}명</Text>
        </View>
      </View>
      <Text style={styles.heroBalanceLabel}>총 잔액</Text>
      <Text style={styles.heroBalanceText}>₩ {account.balance.toLocaleString("ko-KR")}</Text>
      <View style={styles.heroActionRow}>
        <Pressable style={styles.heroGhostButton} onPress={() => onPressAction("income")}>
          <Text style={styles.heroGhostButtonText}>채우기</Text>
        </Pressable>
        <Pressable style={styles.heroPrimaryButton} onPress={() => onPressAction("expense")}>
          <Text style={styles.heroPrimaryButtonText}>보내기</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: uiRadius.xxl,
    backgroundColor: uiColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: uiSpacing.sm,
  },
  heroIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: uiColors.accent,
    textAlign: "center",
    textAlignVertical: "center",
    color: uiColors.surface,
    fontSize: 18,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 6,
  },
  heroTitleWrap: {
    gap: 1,
  },
  heroTitle: {
    color: uiColors.surface,
    fontSize: 17,
    fontWeight: "700",
  },
  heroMeta: {
    color: uiColors.surface,
    fontSize: 12,
    fontWeight: "500",
  },
  heroBalanceLabel: {
    color: uiColors.surface,
    fontSize: 12,
    fontWeight: "600",
  },
  heroBalanceText: {
    color: uiColors.surface,
    fontSize: 28,
    fontWeight: "800",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  heroGhostButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.accent,
    backgroundColor: "rgba(255,253,250,0.12)",
    paddingVertical: 10,
    alignItems: "center",
  },
  heroGhostButtonText: {
    color: uiColors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  heroPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.surface,
    paddingVertical: 10,
    alignItems: "center",
  },
  heroPrimaryButtonText: {
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
})
