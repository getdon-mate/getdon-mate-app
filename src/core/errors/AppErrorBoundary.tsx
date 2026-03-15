import { Component, type ErrorInfo, type ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { logger } from "@shared/lib/logger"
import { uiColors, uiRadius } from "@shared/ui"

interface State {
  hasError: boolean
  message: string
}

function canUseBrowserReload() {
  return typeof globalThis !== "undefined" && !!globalThis.location?.reload
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {
    hasError: false,
    message: "잠시 후 다시 시도해주세요.",
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "잠시 후 다시 시도해주세요.",
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
    this.setState({ hasError: false, message: "잠시 후 다시 시도해주세요." })
  }

  private handleReload = () => {
    if (canUseBrowserReload()) {
      globalThis.location.reload()
      return
    }
    this.handleRetry()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const canReload = canUseBrowserReload()

    return (
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>화면을 불러오는 중 문제가 생겼습니다.</Text>
          <Text style={styles.message}>{this.state.message}</Text>
          <Text style={styles.helpText}>
            {canReload ? "브라우저를 다시 불러오면 대부분 바로 복구됩니다." : "앱 상태를 초기화한 뒤 현재 화면을 다시 열어보세요."}
          </Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonGhost]} onPress={this.handleRetry}>
              <Text style={styles.buttonGhostText}>화면 다시 시도</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonPrimary]} onPress={this.handleReload}>
              <Text style={styles.buttonPrimaryText}>{canReload ? "브라우저 새로고침" : "앱 상태 초기화"}</Text>
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
  helpText: {
    color: uiColors.textSoft,
    fontSize: 13,
    lineHeight: 19,
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
