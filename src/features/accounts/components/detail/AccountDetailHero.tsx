import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useEffect, useRef, useState } from "react"
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
  const [revealingBalance, setRevealingBalance] = useState(false)
  const balanceMasked = maskAmounts && !revealingBalance

  const shimmerOpacity = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (!balanceMasked) {
      shimmerOpacity.setValue(1)
      return
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, { toValue: 0.25, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [balanceMasked, shimmerOpacity])

  return (
    <View style={[styles.heroCard, compact && styles.heroCardCompact]}>
      <View style={styles.heroIdentityRow}>
        <Text style={[styles.heroIcon, compact && styles.heroIconCompact]}>{account.groupName.slice(0, 1)}</Text>
        <View style={styles.heroTitleWrap}>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{account.groupName}</Text>
          <Text style={styles.heroMeta}>모임원 {account.members.length}명</Text>
        </View>
        <View style={[styles.heroQuickActions, compact && styles.heroQuickActionsCompact]}>
          <Pressable style={[styles.iconButton, compact && styles.iconButtonCompact]} onPress={onToggleMask} accessibilityRole="button" accessibilityLabel={maskAmounts ? "잔액 보기" : "잔액 숨기기"}>
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
      <Pressable
        style={styles.balanceWrap}
        onPressIn={() => {
          if (maskAmounts) setRevealingBalance(true)
        }}
        onPressOut={() => setRevealingBalance(false)}
        accessibilityRole="button"
        accessibilityLabel="잔액 길게 누르기"
      >
        <AmountMask
          value={formatKRW(account.balance)}
          masked={balanceMasked}
          textStyle={[styles.heroBalanceText, compact && styles.heroBalanceTextCompact]}
          skeletonHeight={compact ? 26 : 30}
        />
        {balanceMasked ? (
          <Animated.View testID="masked-balance-overlay" pointerEvents="none" style={[styles.maskOverlay, { opacity: shimmerOpacity }]}>
            <Text style={styles.maskOverlayLabel}>금액을 확인하려면 꾹 누르세요.</Text>
          </Animated.View>
        ) : null}
      </Pressable>
      <View style={[styles.heroActionRow, compact && styles.heroActionRowCompact]}>
        <Pressable style={[styles.incomeButton, compact && styles.heroButtonCompact]} onPress={() => onPressAction("income")}>
          <Text style={styles.incomeButtonText}>채우기</Text>
        </Pressable>
        <Pressable style={[styles.expenseButton, compact && styles.heroButtonCompact]} onPress={() => onPressAction("expense")}>
          <Text style={styles.expenseButtonText}>보내기</Text>
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
    alignItems: "flex-start",
    justifyContent: "center",
  },
  maskOverlayLabel: {
    color: uiColors.textSoft,
    fontSize: 16,
    fontWeight: "600",
  },
  heroActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  incomeButton: {
    flexGrow: 1,
    minWidth: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    paddingVertical: 10,
    alignItems: "center",
  },
  incomeButtonText: {
    color: uiColors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  expenseButton: {
    flexGrow: 1,
    minWidth: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.dangerBorder,
    backgroundColor: uiColors.dangerSoft,
    paddingVertical: 10,
    alignItems: "center",
  },
  expenseButtonText: {
    color: uiColors.danger,
    fontSize: 14,
    fontWeight: "700",
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
  heroButtonCompact: {
    paddingVertical: 9,
  },
})
