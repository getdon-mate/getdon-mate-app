import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import * as NativeSplashScreen from "expo-splash-screen"
import { QueryClientProvider } from "@tanstack/react-query"
import { Platform } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AppErrorBoundary } from "@core/errors/AppErrorBoundary"
import { AppProvider, useAppRuntime } from "@core/providers/AppProvider"
import { appQueryClient } from "@core/query/client"
import { FeedbackProvider } from "@core/providers/FeedbackProvider"
import { AppRouter } from "@core/AppRouter"

void NativeSplashScreen.preventAutoHideAsync().catch(() => undefined)

function AppShell() {
  const { isBootstrapping } = useAppRuntime()

  useEffect(() => {
    if (Platform.OS === "web") return

    NativeSplashScreen.setOptions({
      duration: 220,
      fade: true,
    })
  }, [])

  useEffect(() => {
    if (Platform.OS === "web" || isBootstrapping) return
    void NativeSplashScreen.hideAsync().catch(() => undefined)
  }, [isBootstrapping])

  return <AppRouter />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppErrorBoundary>
        <QueryClientProvider client={appQueryClient}>
          <FeedbackProvider>
            <AppProvider>
              <AppShell />
            </AppProvider>
          </FeedbackProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  )
}
