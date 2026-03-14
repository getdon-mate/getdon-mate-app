import { render } from "@testing-library/react-native"
import { AccountListScreen } from "@features/accounts/screens/AccountListScreen"
import { SettingsTab } from "@features/accounts/components/detail-tabs/SettingsTab"
import { AppSettingsScreen } from "@features/auth/screens/AppSettingsScreen"

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

const mockNavigate = jest.fn()
const mockGoBack = jest.fn()

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
      accounts: defaultAccounts,
      selectAccount: jest.fn(),
      resetDemoData: jest.fn(),
    }
  },
  useAppRuntime: () => ({
    isBootstrapping: false,
    dataSource: "demo",
    isRefreshingAccounts: false,
    isMutating: false,
    maskAmounts: false,
    toggleMaskAmounts: jest.fn(),
    refreshAccounts: jest.fn(async () => "demo"),
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
    showToast: jest.fn(),
    showAlert: jest.fn(),
    showError: jest.fn(),
  }),
}))

describe("home global management split", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockGoBack.mockClear()
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

    expect(getByText("알림 설정")).toBeTruthy()
    expect(getByText("로그아웃")).toBeTruthy()
    expect(getByText("회원 탈퇴")).toBeTruthy()
  })
})
