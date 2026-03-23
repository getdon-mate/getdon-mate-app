import { useState } from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius, uiSpacing } from "@shared/ui"

export type DetailTab = "dashboard" | "dues" | "transactions" | "members" | "statistics" | "calendar" | "board" | "settings"

// 기존 코드 호환을 위해 export 유지
export const DETAIL_TAB_META: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "홈" },
  { key: "dues", label: "회비" },
  { key: "transactions", label: "거래내역" },
  { key: "members", label: "멤버" },
  { key: "statistics", label: "통계" },
  { key: "calendar", label: "일정" },
  { key: "board", label: "게시판" },
  { key: "settings", label: "관리" },
]

const PRIMARY_TABS: DetailTab[] = ["dashboard", "transactions", "dues", "members"]

const MORE_TABS: DetailTab[] = ["statistics", "calendar", "board", "settings"]

const TAB_LABELS: Record<DetailTab, string> = {
  dashboard: "홈",
  transactions: "거래내역",
  dues: "회비",
  members: "멤버",
  statistics: "통계",
  calendar: "일정",
  board: "게시판",
  settings: "관리",
}

export function DetailTabBar({ activeTab, onChangeTab }: { activeTab: DetailTab; onChangeTab: (tab: DetailTab) => void }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const isMoreActive = MORE_TABS.includes(activeTab)

  return (
    <>
      <Modal
        visible={moreOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMoreOpen(false)}
      >
        <Pressable style={styles.moreOverlay} onPress={() => setMoreOpen(false)}>
          <Pressable style={styles.moreSheet} onPress={() => {}}>
            <Text style={styles.moreTitle}>더 보기</Text>
            {MORE_TABS.map((tabKey) => (
              <Pressable
                key={tabKey}
                style={[styles.moreItem, activeTab === tabKey && styles.moreItemActive]}
                onPress={() => {
                  onChangeTab(tabKey)
                  setMoreOpen(false)
                }}
                accessibilityRole="button"
                accessibilityLabel={`${TAB_LABELS[tabKey]} 탭으로 이동`}
              >
                <Text style={[styles.moreItemLabel, activeTab === tabKey && styles.moreItemLabelActive]}>
                  {TAB_LABELS[tabKey]}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.bottomNav}>
        {PRIMARY_TABS.map((key) => {
          const active = activeTab === key
          return (
            <Pressable
              key={key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onChangeTab(key)}
              accessibilityRole="tab"
              accessibilityLabel={`${TAB_LABELS[key]} 탭`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {TAB_LABELS[key]}
              </Text>
            </Pressable>
          )
        })}
        <Pressable
          style={[styles.navItem, isMoreActive && styles.navItemActive]}
          onPress={() => setMoreOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="더 보기"
        >
          <Text style={[styles.navLabel, isMoreActive && styles.navLabelActive]}>
            {isMoreActive ? TAB_LABELS[activeTab] : "더보기"}
          </Text>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: uiRadius.full,
    minHeight: 44,
  },
  navItemActive: {
    backgroundColor: uiColors.primarySoft,
  },
  navLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  navLabelActive: {
    color: uiColors.primary,
    fontWeight: "800",
  },
  moreOverlay: {
    flex: 1,
    backgroundColor: uiColors.overlayStrong,
    justifyContent: "flex-end",
  },
  moreSheet: {
    backgroundColor: uiColors.surface,
    borderTopLeftRadius: uiRadius.xl,
    borderTopRightRadius: uiRadius.xl,
    paddingBottom: uiSpacing.xxl,
    overflow: "hidden",
  },
  moreTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: uiColors.textMuted,
    textAlign: "center",
    paddingVertical: uiSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  moreItem: {
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  moreItemActive: {
    backgroundColor: uiColors.primarySoft,
  },
  moreItemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: uiColors.textStrong,
  },
  moreItemLabelActive: {
    color: uiColors.primary,
    fontWeight: "700",
  },
})
