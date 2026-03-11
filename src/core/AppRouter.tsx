import { View, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApp } from "./providers/AppProvider"
import { LoginScreen } from "../features/auth/screens/LoginScreen"
import { AccountListScreen } from "../features/accounts/screens/AccountListScreen"
import { AccountDetailScreen } from "../features/accounts/screens/AccountDetailScreen"

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
