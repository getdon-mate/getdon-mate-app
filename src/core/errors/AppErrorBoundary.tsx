import { Component, type ErrorInfo, type ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { logger } from "@shared/lib/logger"
import { uiColors, uiRadius } from "@shared/ui"

interface State {
  hasError: boolean
  message: string
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {
    hasError: false,
    message: "예기치 못한 오류가 발생했습니다.",
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "예기치 못한 오류가 발생했습니다.",
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({
      scope: "ui.error-boundary",
      message: error.message,
      details: {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: "예기치 못한 오류가 발생했습니다." })
  }

  private handleReload = () => {
    if (typeof globalThis !== "undefined" && "location" in globalThis) {
      globalThis.location.reload()
      return
    }
    this.handleRetry()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>앱 실행 중 오류가 발생했습니다.</Text>
          <Text style={styles.message}>{this.state.message}</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonGhost]} onPress={this.handleRetry}>
              <Text style={styles.buttonGhostText}>다시 시도</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonPrimary]} onPress={this.handleReload}>
              <Text style={styles.buttonPrimaryText}>새로고침</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: uiColors.background,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    padding: 18,
    gap: 10,
  },
  title: {
    color: uiColors.textStrong,
    fontSize: 18,
    fontWeight: "700",
  },
  message: {
    color: uiColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  button: {
    flex: 1,
    borderRadius: uiRadius.md,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonGhost: {
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
  },
  buttonPrimary: {
    borderColor: uiColors.primary,
    backgroundColor: uiColors.primary,
  },
  buttonGhostText: {
    color: uiColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPrimaryText: {
    color: uiColors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
})
