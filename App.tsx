import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AppProvider } from "./src/app/providers/AppProvider"
import { AppRouter } from "./src/app/AppRouter"

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
