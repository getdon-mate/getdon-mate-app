import { View, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AccountDetailScreen } from "@features/accounts/screens/AccountDetailScreen"
import { AccountListScreen } from "@features/accounts/screens/AccountListScreen"
import { LoginScreen } from "@features/auth/screens/LoginScreen"
import { useApp } from "./providers/AppProvider"

export function AppRouter() {
  const { currentView } = useApp()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {currentView === "login" && <LoginScreen />}
        {currentView === "account-list" && <AccountListScreen />}
        {currentView === "account-detail" && <AccountDetailScreen />}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  container: {
    flex: 1,
  },
})
