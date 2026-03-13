import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { NotificationSettingsScreen } from "@features/auth/screens/NotificationSettingsScreen"

const mockGoBack = jest.fn()
const mockAddListener = jest.fn(() => jest.fn())
const mockConfirm = jest.fn(async () => true)
const mockShowToast = jest.fn()
const mockUpdateNotificationPreferences = jest.fn(async () => undefined)
const notificationPreferences = {
  duesReminder: true,
  transactionAlert: true,
  noticeAlert: false,
}
const defaultNotificationPreferences = {
  duesReminder: true,
  transactionAlert: true,
  noticeAlert: true,
}

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    addListener: mockAddListener,
  }),
}))

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

jest.mock("@core/providers/AppProvider", () => ({
  useAppRuntime: () => ({
    notificationPreferences,
    defaultNotificationPreferences,
    updateNotificationPreferences: mockUpdateNotificationPreferences,
  }),
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    showToast: mockShowToast,
    confirm: mockConfirm,
  }),
}))

describe("NotificationSettingsScreen", () => {
  beforeEach(() => {
    mockGoBack.mockClear()
    mockAddListener.mockClear()
    mockConfirm.mockClear()
    mockShowToast.mockClear()
    mockUpdateNotificationPreferences.mockClear()
  })

  test("cancel asks for confirmation when there are unsaved changes", async () => {
    const { getByLabelText, getByText } = render(<NotificationSettingsScreen />)

    fireEvent.press(getByLabelText("공지 알림 토글"))
    fireEvent.press(getByText("취소"))

    await waitFor(() =>
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "변경 내용 폐기",
        })
      )
    )
    await waitFor(() => expect(mockGoBack).toHaveBeenCalled())
  })

  test("save exits without discard confirm", async () => {
    const { getByLabelText, getByText } = render(<NotificationSettingsScreen />)

    fireEvent.press(getByLabelText("공지 알림 토글"))
    fireEvent.press(getByText("저장"))

    await waitFor(() =>
      expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith({
        duesReminder: true,
        transactionAlert: true,
        noticeAlert: true,
      })
    )
    expect(mockConfirm).not.toHaveBeenCalled()
  })
})
