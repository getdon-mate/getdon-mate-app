import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { LoginScreen } from "@features/auth/screens/LoginScreen"

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

const mockRuntimeState = {
  isBootstrapping: false,
  prefersRealApi: false,
  lastSyncError: null as string | null,
  authRecoveryNotice: null as string | null,
}

const mockAuthState = {
  login: jest.fn(async () => true),
  signup: jest.fn(async () => true),
}

const mockFeedbackState = {
  showError: jest.fn(),
  showToast: jest.fn(),
}

jest.mock("@core/providers/AppProvider", () => ({
  useAppRuntime: () => ({
    ...mockRuntimeState,
  }),
  useAppAuth: () => ({
    ...mockAuthState,
  }),
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    ...mockFeedbackState,
  }),
}))

describe("LoginScreen", () => {
  beforeEach(() => {
    mockRuntimeState.isBootstrapping = false
    mockRuntimeState.prefersRealApi = false
    mockRuntimeState.lastSyncError = null
    mockRuntimeState.authRecoveryNotice = null
    mockAuthState.login = jest.fn(async () => true)
    mockAuthState.signup = jest.fn(async () => true)
    mockFeedbackState.showError = jest.fn()
    mockFeedbackState.showToast = jest.fn()
  })

  test("renders social login call-to-actions", () => {
    const { getByText } = render(<LoginScreen />)

    expect(getByText("Google로 계속하기")).toBeTruthy()
    expect(getByText("카카오로 계속하기")).toBeTruthy()
  })

  test("shows recovery banner when remote bootstrap fell back to demo mode", () => {
    mockRuntimeState.prefersRealApi = true
    mockRuntimeState.lastSyncError = "서버 연결을 확인할 수 없습니다."
    mockRuntimeState.authRecoveryNotice = "저장된 로그인 정보를 복원하지 못해 다시 확인이 필요합니다."

    const { getByText } = render(<LoginScreen />)

    expect(getByText("저장된 로그인 정보를 복원하지 못해 다시 확인이 필요합니다.")).toBeTruthy()
    expect(getByText("실서버 연결이 불안정해 데모 데이터로 이어집니다.")).toBeTruthy()
    expect(getByText("서버 연결을 확인할 수 없습니다.")).toBeTruthy()
  })

  test("allows continuing without manual credential entry", async () => {
    const { getByRole } = render(<LoginScreen />)

    fireEvent.press(getByRole("button", { name: "둘러보기" }))

    await waitFor(() => {
      expect(mockAuthState.login).toHaveBeenCalledWith("test@test.com", "password")
    })
    expect(mockFeedbackState.showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "success",
        title: "둘러보기 시작",
      })
    )
  })
})
