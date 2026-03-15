import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { AmountMask, Icon, uiColors, uiRadius, uiSpacing } from "@shared/ui"
import { formatKRW } from "@shared/lib/format"
import type { GroupAccount, TransactionType } from "../../model/types"

export function AccountDetailHero({
  account,
  maskAmounts,
  onToggleMask,
  onCopyInvite,
  onShareInvite,
  onPressAction,
}: {
  account: GroupAccount
  maskAmounts: boolean
  onToggleMask: () => void
  onCopyInvite: () => void | Promise<void>
  onShareInvite: () => void | Promise<void>
  onPressAction: (type: TransactionType) => void
}) {
  const { width } = useWindowDimensions()
  const compact = width < 390

  return (
    <View style={[styles.heroCard, compact && styles.heroCardCompact]}>
      <View style={styles.heroIdentityRow}>
        <Text style={[styles.heroIcon, compact && styles.heroIconCompact]}>{account.groupName.slice(0, 1)}</Text>
        <View style={styles.heroTitleWrap}>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{account.groupName}</Text>
          <Text style={styles.heroMeta}>모임원 {account.members.length}명</Text>
        </View>
        <View style={[styles.heroQuickActions, compact && styles.heroQuickActionsCompact]}>
          <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={onToggleMask} accessibilityRole="button" accessibilityLabel="금액 표시 전환">
            <Icon name={maskAmounts ? "eyeOff" : "eye"} size={18} color={uiColors.textStrong} />
          </Pressable>
          <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={() => void onCopyInvite()} accessibilityRole="button" accessibilityLabel="초대 링크 복사">
            <Icon name="copy" size={18} color={uiColors.textStrong} />
          </Pressable>
          <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={() => void onShareInvite()} accessibilityRole="button" accessibilityLabel="모임통장 공유">
            <Icon name="share" size={18} color={uiColors.textStrong} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.heroBalanceLabel}>총 잔액</Text>
      <View style={styles.balanceWrap}>
        <AmountMask
          value={formatKRW(account.balance)}
          masked={maskAmounts}
          textStyle={[styles.heroBalanceText, compact && styles.heroBalanceTextCompact]}
          skeletonHeight={compact ? 26 : 30}
        />
        {maskAmounts ? (
          <View testID="masked-balance-overlay" pointerEvents="none" style={styles.maskOverlay}>
            <Text style={styles.maskOverlayLabel}>잔액은 필요할 때만 확인하세요</Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.heroActionRow, compact && styles.heroActionRowCompact]}>
        <Pressable style={[styles.heroGhostButton, compact && styles.heroButtonCompact]} onPress={() => onPressAction("income")}>
          <Text style={styles.heroGhostButtonText}>채우기</Text>
        </Pressable>
        <Pressable style={[styles.heroPrimaryButton, compact && styles.heroButtonCompact]} onPress={() => onPressAction("expense")}>
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
    backgroundColor: uiColors.surface,
    borderWidth: 1,
    borderColor: uiColors.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: uiSpacing.sm,
  },
  heroCardCompact: {
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
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
    backgroundColor: uiColors.primarySoft,
    textAlign: "center",
    textAlignVertical: "center",
    color: uiColors.primary,
    fontSize: 18,
    fontWeight: "700",
    overflow: "hidden",
    paddingTop: 6,
  },
  heroIconCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
    fontSize: 16,
    paddingTop: 4,
  },
  heroTitleWrap: {
    gap: 1,
    flex: 1,
  },
  heroTitle: {
    color: uiColors.textStrong,
    fontSize: 17,
    fontWeight: "700",
  },
  heroTitleCompact: {
    fontSize: 16,
  },
  heroMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  heroBalanceLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  heroBalanceText: {
    color: uiColors.textStrong,
    fontSize: 28,
    fontWeight: "800",
  },
  heroBalanceTextCompact: {
    fontSize: 24,
  },
  balanceWrap: {
    position: "relative",
    minHeight: 40,
    justifyContent: "center",
  },
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    backgroundColor: "rgba(248, 250, 252, 0.82)",
    borderWidth: 1,
    borderColor: uiColors.border,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  maskOverlayLabel: {
    color: uiColors.textSoft,
    fontSize: 11,
    fontWeight: "600",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  heroActionRowCompact: {
    gap: 8,
  },
  heroQuickActions: {
    flexDirection: "row",
    gap: 8,
  },
  heroQuickActionsCompact: {
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonCompact: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  heroGhostButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    paddingVertical: 10,
    alignItems: "center",
  },
  heroButtonCompact: {
    paddingVertical: 9,
  },
  heroGhostButtonText: {
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  heroPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 10,
    alignItems: "center",
  },
  heroPrimaryButtonText: {
    color: uiColors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
})
