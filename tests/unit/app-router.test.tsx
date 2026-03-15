import { render } from "@testing-library/react-native"
import { AppRouter } from "@core/AppRouter"

const mockState = {
  currentUser: null as null | { id: string },
  accounts: [] as { id: string }[],
  selectedAccountId: null as null | string,
  isBootstrapping: true,
  isMutating: false,
}

jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigationContainerRef: () => ({
    isReady: () => true,
    getCurrentRoute: () => ({ name: "Login" }),
    reset: jest.fn(),
    navigate: jest.fn(),
  }),
}))

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => {
    const Screen = ({ children }: { children?: React.ReactNode }) => children ?? null
    const Navigator = ({ children }: { children?: React.ReactNode }) => children ?? null
    return { Screen, Navigator }
  },
}))

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(async () => undefined),
  hideAsync: jest.fn(async () => undefined),
}), { virtual: true })

jest.mock("@core/providers/AppProvider", () => ({
  useAppAuth: () => ({
    currentUser: mockState.currentUser,
  }),
  useAppRuntime: () => ({
    isBootstrapping: mockState.isBootstrapping,
    isMutating: mockState.isMutating,
  }),
  useAppAccounts: () => ({
    accounts: mockState.accounts,
    selectedAccountId: mockState.selectedAccountId,
    selectAccount: jest.fn(),
  }),
}))

jest.mock("@features/accounts/screens/AccountCreateScreen", () => ({
  AccountCreateScreen: () => null,
}))
jest.mock("@features/accounts/screens/AccountDetailScreen", () => ({
  AccountDetailScreen: () => null,
}))
jest.mock("@features/accounts/screens/AccountListScreen", () => ({
  AccountListScreen: () => null,
}))
jest.mock("@features/auth/screens/AppSettingsScreen", () => ({
  AppSettingsScreen: () => null,
}))
jest.mock("@features/auth/screens/LoginScreen", () => ({
  LoginScreen: () => null,
}))
jest.mock("@features/auth/screens/MyPageScreen", () => ({
  MyPageScreen: () => null,
}))
jest.mock("@features/auth/screens/NotificationListScreen", () => ({
  NotificationListScreen: () => null,
}))
jest.mock("@features/auth/screens/NotificationSettingsScreen", () => ({
  NotificationSettingsScreen: () => null,
}))

describe("AppRouter", () => {
  beforeEach(() => {
    mockState.currentUser = null
    mockState.accounts = []
    mockState.selectedAccountId = null
    mockState.isBootstrapping = true
    mockState.isMutating = false
  })

  test("renders splash shell while bootstrapping", () => {
    const { getByText } = render(<AppRouter />)

    expect(getByText("getdon mate")).toBeTruthy()
    expect(getByText("시작 준비 중")).toBeTruthy()
    expect(getByText("모임통장과 알림 상태를 맞추고 있어요.")).toBeTruthy()
  })

  test("renders busy overlay after bootstrap", () => {
    mockState.isBootstrapping = false
    mockState.isMutating = true

    const { getByText } = render(<AppRouter />)

    expect(getByText("업데이트 중")).toBeTruthy()
  })
})
