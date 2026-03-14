import { render } from "@testing-library/react-native"
import { LoginScreen } from "@features/auth/screens/LoginScreen"

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

jest.mock("@core/providers/AppProvider", () => ({
  useAppRuntime: () => ({
    isBootstrapping: false,
  }),
  useAppAuth: () => ({
    login: jest.fn(async () => true),
    signup: jest.fn(async () => true),
  }),
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    showError: jest.fn(),
    showToast: jest.fn(),
  }),
}))

describe("LoginScreen", () => {
  test("renders social login call-to-actions", () => {
    const { getByText } = render(<LoginScreen />)

    expect(getByText("Google로 계속하기")).toBeTruthy()
    expect(getByText("카카오로 계속하기")).toBeTruthy()
  })
})
