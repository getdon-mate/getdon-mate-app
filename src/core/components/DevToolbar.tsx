import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useApp } from "@core/providers/AppProvider"
import { Badge, Button } from "@shared/ui"

export function DevToolbar() {
  const [enabled, setEnabled] = useState(true)
  const { currentView, currentUser, accounts, login, logout, setCurrentView, selectAccount, resetDemoData } = useApp()

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Badge label={`DEV ${enabled ? "ON" : "OFF"}`} tone={enabled ? "primary" : "neutral"} />
        <Text style={styles.meta}>view: {currentView}</Text>
        <Button
          style={styles.toggleButton}
          variant="ghost"
          label={enabled ? "숨기기" : "표시"}
          onPress={() => setEnabled((prev) => !prev)}
        />
      </View>

      {enabled && (
        <View style={styles.actions}>
          <View style={styles.row}>
            <Button style={styles.action} variant="ghost" label="login" onPress={() => setCurrentView("login")} />
            <Button style={styles.action} variant="ghost" label="list" onPress={() => setCurrentView("account-list")} />
            <Button
              style={styles.action}
              variant="ghost"
              label="detail"
              onPress={() => {
                if (accounts.length > 0) selectAccount(accounts[0].id)
              }}
              disabled={accounts.length === 0}
            />
          </View>
          <View style={styles.row}>
            {currentUser ? (
              <Button style={styles.action} variant="secondary" label="로그아웃" onPress={logout} />
            ) : (
              <Button
                style={styles.action}
                variant="secondary"
                label="테스트 로그인"
                onPress={() => {
                  login("test@test.com", "password")
                }}
              />
            )}
            <Button style={styles.action} variant="danger" label="데이터 초기화" onPress={resetDemoData} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    zIndex: 100,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  toggleButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    minWidth: 64,
  },
  actions: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  action: {
    flex: 1,
    minHeight: 36,
  },
})
