import { useCallback, useEffect, useMemo } from "react"
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AccountDetailScreen } from "@features/accounts/screens/AccountDetailScreen"
import { AccountListScreen } from "@features/accounts/screens/AccountListScreen"
import { LoginScreen } from "@features/auth/screens/LoginScreen"
import type { RootStackParamList } from "./navigation/types"
import { useApp } from "./providers/AppProvider"

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AppRouter() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const { currentUser, accounts, selectedAccountId } = useApp()
  const hasSelectedAccount = useMemo(
    () => Boolean(selectedAccountId && accounts.some((account) => account.id === selectedAccountId)),
    [accounts, selectedAccountId]
  )

  const syncNavigation = useCallback(() => {
    if (!navigationRef.isReady()) return
    const currentRoute = navigationRef.getCurrentRoute()?.name

    if (!currentUser) {
      if (currentRoute !== "Login") {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      }
      return
    }

    if (currentRoute === "Login") {
      navigationRef.reset({
        index: 0,
        routes: [{ name: "AccountList" }],
      })
      return
    }

    if (currentRoute === "AccountDetail" && !hasSelectedAccount) {
      navigationRef.navigate("AccountList")
    }
  }, [currentUser, hasSelectedAccount, navigationRef])

  useEffect(() => {
    syncNavigation()
  }, [syncNavigation])

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer ref={navigationRef} onReady={syncNavigation} onStateChange={syncNavigation}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: styles.container,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AccountList" component={AccountListScreen} />
          <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
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
