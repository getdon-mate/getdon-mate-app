import { StyleSheet, Text, View } from "react-native"
import { uiColors } from "@shared/ui"
import type { GroupAccount } from "../../model/types"
import { AccountInfoPanel } from "../detail-panels/AccountInfoPanel"
import { AutoTransferPanel } from "../detail-panels/AutoTransferPanel"
import { DangerZonePanel } from "../detail-panels/DangerZonePanel"
import { OneTimeDuesPanel } from "../detail-panels/OneTimeDuesPanel"

export function SettingsTab({ account }: { account: GroupAccount }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.pageTitle}>설정</Text>
      <View style={styles.stack}>
        <AccountInfoPanel account={account} />
        <AutoTransferPanel account={account} />
        <OneTimeDuesPanel account={account} />
        <DangerZonePanel account={account} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: uiColors.textStrong,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stack: {
    gap: 14,
    paddingTop: 14,
  },
})
