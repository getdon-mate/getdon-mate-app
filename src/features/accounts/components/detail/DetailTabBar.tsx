import { Pressable, StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"

export type DetailTab = "dashboard" | "dues" | "transactions" | "members" | "settings"

export const DETAIL_TAB_META: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "홈" },
  { key: "dues", label: "회비" },
  { key: "transactions", label: "거래" },
  { key: "members", label: "멤버" },
  { key: "settings", label: "관리" },
]

export function DetailTabBar({ activeTab, onChangeTab }: { activeTab: DetailTab; onChangeTab: (tab: DetailTab) => void }) {
  return (
    <View style={styles.bottomNav}>
      {DETAIL_TAB_META.map((item) => {
        const active = activeTab === item.key
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => onChangeTab(item.key)}
            accessibilityRole="tab"
            accessibilityLabel={`${item.label} 탭`}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
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
