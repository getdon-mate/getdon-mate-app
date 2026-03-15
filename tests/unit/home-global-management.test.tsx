import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { AccountListScreen } from "@features/accounts/screens/AccountListScreen"
import { SettingsTab } from "@features/accounts/components/detail-tabs/SettingsTab"
import { AppSettingsScreen } from "@features/auth/screens/AppSettingsScreen"

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

const mockNavigate = jest.fn()
const mockGoBack = jest.fn()
const mockShowToast = jest.fn()
const mockRefreshAccounts = jest.fn(async () => "demo")
const mockToggleMaskAmounts = jest.fn()
let mockAccountsMode: "default" | "empty" = "default"
let mockMaskAmounts = false

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}))

jest.mock("@core/providers/AppProvider", () => ({
  useAppAuth: () => {
    const { defaultUsers } = require("@features/accounts/model/fixtures")
    return { currentUser: defaultUsers[0] }
  },
  useAppAccounts: () => {
    const { defaultAccounts } = require("@features/accounts/model/fixtures")
    return {
      accounts: mockAccountsMode === "empty" ? [] : defaultAccounts,
      selectAccount: jest.fn(),
      resetDemoData: jest.fn(),
    }
  },
  useAppRuntime: () => ({
    isBootstrapping: false,
    dataSource: "demo",
    isRefreshingAccounts: false,
    isMutating: false,
    maskAmounts: mockMaskAmounts,
    toggleMaskAmounts: mockToggleMaskAmounts,
    refreshAccounts: mockRefreshAccounts,
    unreadNotificationCount: 2,
    notificationPreferences: {
      duesReminder: true,
      transactionAlert: true,
      noticeAlert: true,
    },
    updateNotificationPreferences: jest.fn(async () => undefined),
  }),
  useApp: () => {
    const { defaultUsers } = require("@features/accounts/model/fixtures")
    return {
      currentUser: defaultUsers[0],
      updateAutoTransfer: jest.fn(async () => undefined),
      updateAccount: jest.fn(async () => undefined),
      createOneTimeDues: jest.fn(async () => undefined),
      updateOneTimeDues: jest.fn(async () => undefined),
      closeOneTimeDues: jest.fn(async () => undefined),
      deleteOneTimeDues: jest.fn(async () => undefined),
      toggleOneTimeDuesRecord: jest.fn(async () => undefined),
      deleteAccount: jest.fn(async () => undefined),
      logout: jest.fn(),
      withdraw: jest.fn(),
    }
  },
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    confirmDanger: jest.fn(async () => true),
    confirm: jest.fn(async () => true),
    showToast: mockShowToast,
    showAlert: jest.fn(),
    showError: jest.fn(),
  }),
}))

describe("home global management split", () => {
  beforeEach(() => {
    mockAccountsMode = "default"
    mockMaskAmounts = false
    mockNavigate.mockClear()
    mockGoBack.mockClear()
    mockShowToast.mockClear()
    mockRefreshAccounts.mockClear()
    mockToggleMaskAmounts.mockClear()
  })

  test("account list exposes global actions and removes demo reset button", () => {
    const { queryByText, getByLabelText, getByTestId } = render(<AccountListScreen />)

    expect(queryByText("데모 데이터 초기화")).toBeNull()
    expect(getByLabelText("알림 목록 열기")).toBeTruthy()
    expect(getByLabelText("마이페이지 열기")).toBeTruthy()
    expect(getByLabelText("앱 설정 열기")).toBeTruthy()
    expect(getByTestId("notification-badge")).toBeTruthy()
  })

  test("account detail settings keeps only account-scoped management", () => {
    const { defaultAccounts } = require("@features/accounts/model/fixtures")
    const { queryByText } = render(<SettingsTab account={defaultAccounts[0]} />)

    expect(queryByText("프로필 관리")).toBeNull()
    expect(queryByText("알림 설정")).toBeNull()
    expect(queryByText("로그아웃")).toBeNull()
    expect(queryByText("회원 탈퇴")).toBeNull()
    expect(queryByText("계좌 요약")).toBeTruthy()
  })

  test("app settings screen owns global account actions", () => {
    const { getByText } = render(<AppSettingsScreen />)

    expect(getByText("빠른 이동")).toBeTruthy()
    expect(getByText("계정 액션")).toBeTruthy()
    expect(getByText("알림 설정")).toBeTruthy()
    expect(getByText("로그아웃")).toBeTruthy()
    expect(getByText("회원 탈퇴")).toBeTruthy()
  })

  test("account list empty state uses shorter setup copy and a direct create CTA", () => {
    mockAccountsMode = "empty"
    const { getByText } = render(<AccountListScreen />)

    expect(getByText("아직 모임통장이 없습니다.")).toBeTruthy()
    expect(getByText("새 모임통장을 열고 회비 관리를 시작하세요.")).toBeTruthy()
    fireEvent.press(getByText("모임통장 만들기"))

    expect(mockNavigate).toHaveBeenCalledWith("AccountCreate")
  })

  test("account list refresh surfaces a sync toast", async () => {
    const { getByLabelText } = render(<AccountListScreen />)

    fireEvent.press(getByLabelText("모임통장 목록 새로고침"))

    await waitFor(() => expect(mockRefreshAccounts).toHaveBeenCalledTimes(1))
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "warning",
        title: "데모 데이터 유지",
      })
    )
  })

  test("masked preference is reflected on the home account cards", () => {
    mockMaskAmounts = true
    const { getAllByTestId } = render(<AccountListScreen />)

    expect(getAllByTestId("masked-amount").length).toBeGreaterThan(0)
  })

  test("account list search and attention filter can narrow the visible accounts", () => {
    const { getByLabelText, getByText, queryByText } = render(<AccountListScreen />)

    fireEvent.press(getByText("미납 2명+"))

    expect(getByText("개발자 스터디 모임")).toBeTruthy()
    expect(queryByText("주말 산악회")).toBeNull()

    fireEvent.changeText(getByLabelText("모임통장 검색"), "산악")

    expect(getByText("조건에 맞는 모임통장이 없습니다.")).toBeTruthy()
    fireEvent.press(getByText("필터 초기화"))

    expect(getByText("주말 산악회")).toBeTruthy()
  })

  test("account list status badges distinguish attention and stable groups", () => {
    const { getByText } = render(<AccountListScreen />)

    expect(getByText("정산 필요")).toBeTruthy()
    expect(getByText("안정")).toBeTruthy()
  })
})
