import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { AlertModal, ConfirmDialog, Toast } from "@shared/ui"

type ToastTone = "info" | "success" | "warning" | "danger"
type AlertTone = "neutral" | "danger"
type ConfirmTone = "primary" | "danger"

interface FeedbackContextValue {
  showToast: (params: { title: string; message?: string; tone?: ToastTone }) => void
  showAlert: (params: { title: string; message?: string; tone?: AlertTone; confirmLabel?: string }) => void
  confirm: (params: {
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmTone?: ConfirmTone
  }) => Promise<boolean>
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback() {
  const value = useContext(FeedbackContext)
  if (!value) {
    throw new Error("useFeedback must be used within FeedbackProvider")
  }
  return value
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toastState, setToastState] = useState({
    visible: false,
    title: "",
    message: "",
    tone: "info" as ToastTone,
  })
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    tone: "neutral" as AlertTone,
    confirmLabel: "확인",
  })
  const [confirmState, setConfirmState] = useState({
    visible: false,
    title: "",
    message: "",
    confirmLabel: "확인",
    cancelLabel: "취소",
    confirmTone: "primary" as ConfirmTone,
    resolve: null as ((value: boolean) => void) | null,
  })

  const showToast = useCallback(
    ({ title, message = "", tone = "info" }: { title: string; message?: string; tone?: ToastTone }) => {
      setToastState({
        visible: true,
        title,
        message,
        tone,
      })
    },
    []
  )

  const showAlert = useCallback(
    ({
      title,
      message = "",
      tone = "neutral",
      confirmLabel = "확인",
    }: {
      title: string
      message?: string
      tone?: AlertTone
      confirmLabel?: string
    }) => {
      setAlertState({
        visible: true,
        title,
        message,
        tone,
        confirmLabel,
      })
    },
    []
  )

  const confirm = useCallback(
    ({
      title,
      message = "",
      confirmLabel = "확인",
      cancelLabel = "취소",
      confirmTone = "primary",
    }: {
      title: string
      message?: string
      confirmLabel?: string
      cancelLabel?: string
      confirmTone?: ConfirmTone
    }) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({
          visible: true,
          title,
          message,
          confirmLabel,
          cancelLabel,
          confirmTone,
          resolve,
        })
      }),
    []
  )

  const value = useMemo(
    () => ({
      showToast,
      showAlert,
      confirm,
    }),
    [showToast, showAlert, confirm]
  )

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Toast
        visible={toastState.visible}
        title={toastState.title}
        message={toastState.message}
        tone={toastState.tone}
        onClose={() => setToastState((prev) => ({ ...prev, visible: false }))}
      />
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        tone={alertState.tone}
        confirmLabel={alertState.confirmLabel}
        onClose={() => setAlertState((prev) => ({ ...prev, visible: false }))}
      />
      <ConfirmDialog
        visible={confirmState.visible}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        confirmTone={confirmState.confirmTone}
        onCancel={() => {
          confirmState.resolve?.(false)
          setConfirmState((prev) => ({ ...prev, visible: false, resolve: null }))
        }}
        onConfirm={() => {
          confirmState.resolve?.(true)
          setConfirmState((prev) => ({ ...prev, visible: false, resolve: null }))
        }}
      />
    </FeedbackContext.Provider>
  )
}
