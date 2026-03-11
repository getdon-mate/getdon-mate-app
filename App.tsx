import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AppProvider } from "@core/providers/AppProvider"
import { AppRouter } from "@core/AppRouter"

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </SafeAreaProvider>
  )
}
