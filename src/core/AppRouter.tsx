import { useCallback, useEffect, useMemo } from "react"
import { NavigationContainer, useNavigationContainerRef, type LinkingOptions } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AccountCreateScreen } from "@features/accounts/screens/AccountCreateScreen"
import { AccountDetailScreen } from "@features/accounts/screens/AccountDetailScreen"
import { AccountListScreen } from "@features/accounts/screens/AccountListScreen"
import { LoginScreen } from "@features/auth/screens/LoginScreen"
import { MyPageScreen } from "@features/auth/screens/MyPageScreen"
import { NotificationSettingsScreen } from "@features/auth/screens/NotificationSettingsScreen"
import { uiColors } from "@shared/ui"
import { ROUTES } from "./navigation/routes"
import type { RootStackParamList } from "./navigation/types"
import { useAppAccounts, useAppAuth } from "./providers/AppProvider"

const Stack = createNativeStackNavigator<RootStackParamList>()

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      [ROUTES.Login]: "login",
      [ROUTES.AccountList]: "accounts",
      [ROUTES.AccountCreate]: "accounts/create",
      [ROUTES.AccountDetail]: "accounts/:accountId?",
      [ROUTES.MyPage]: "me",
      [ROUTES.NotificationSettings]: "settings/notifications",
    },
  },
}

export function AppRouter() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const { currentUser } = useAppAuth()
  const { accounts, selectedAccountId, selectAccount } = useAppAccounts()
  const hasSelectedAccount = useMemo(
    () => Boolean(selectedAccountId && accounts.some((account) => account.id === selectedAccountId)),
    [accounts, selectedAccountId]
  )

  const syncNavigation = useCallback(() => {
    if (!navigationRef.isReady()) return
    const currentRoute = navigationRef.getCurrentRoute()
    const currentRouteName = currentRoute?.name

    if (!currentUser) {
      if (currentRouteName !== ROUTES.Login) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: ROUTES.Login }],
        })
      }
      return
    }

    if (currentRouteName === ROUTES.Login) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: ROUTES.AccountList }],
      })
      return
    }

    if (currentRouteName === ROUTES.AccountDetail) {
      const accountId = (currentRoute?.params as { accountId?: string } | undefined)?.accountId
      if (accountId && accounts.some((account) => account.id === accountId)) {
        if (selectedAccountId !== accountId) {
          selectAccount(accountId)
        }
        return
      }

      if (!hasSelectedAccount) {
        navigationRef.navigate(ROUTES.AccountList)
      }
    }
  }, [accounts, currentUser, hasSelectedAccount, navigationRef, selectAccount, selectedAccountId])

  useEffect(() => {
    syncNavigation()
  }, [syncNavigation])

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer linking={linking} ref={navigationRef} onReady={syncNavigation} onStateChange={syncNavigation}>
        <Stack.Navigator
          initialRouteName={ROUTES.Login}
          screenOptions={{
            headerShown: false,
            contentStyle: styles.container,
          }}
        >
          <Stack.Screen name={ROUTES.Login} component={LoginScreen} />
          <Stack.Screen name={ROUTES.AccountList} component={AccountListScreen} />
          <Stack.Screen name={ROUTES.AccountCreate} component={AccountCreateScreen} />
          <Stack.Screen name={ROUTES.AccountDetail} component={AccountDetailScreen} />
          <Stack.Screen name={ROUTES.MyPage} component={MyPageScreen} />
          <Stack.Screen name={ROUTES.NotificationSettings} component={NotificationSettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: uiColors.background,
  },
  container: {
    flex: 1,
  },
})
