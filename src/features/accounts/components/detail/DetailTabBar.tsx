import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"

export type DetailTab = "dashboard" | "dues" | "transactions" | "members" | "statistics" | "calendar" | "board" | "settings"

export const DETAIL_TAB_META: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "홈" },
  { key: "dues", label: "회비" },
  { key: "transactions", label: "거래" },
  { key: "members", label: "멤버" },
  { key: "statistics", label: "통계" },
  { key: "calendar", label: "일정" },
  { key: "board", label: "게시판" },
  { key: "settings", label: "관리" },
]

export function DetailTabBar({ activeTab, onChangeTab }: { activeTab: DetailTab; onChangeTab: (tab: DetailTab) => void }) {
  return (
    <View style={styles.bottomNav}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {DETAIL_TAB_META.map((item) => {
          const active = activeTab === item.key
          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onChangeTab(item.key)}
              accessibilityRole="tab"
              accessibilityLabel={`${item.label} 탭`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    borderTopWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 6,
  },
  navItem: {
    minWidth: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: uiColors.surface,
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
})
