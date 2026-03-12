import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AppProvider } from "@core/providers/AppProvider"
import { FeedbackProvider } from "@core/providers/FeedbackProvider"
import { AppRouter } from "@core/AppRouter"

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <FeedbackProvider>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </FeedbackProvider>
    </SafeAreaProvider>
  )
}
