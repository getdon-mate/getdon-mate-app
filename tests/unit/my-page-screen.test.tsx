import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { MyPageScreen } from "@features/auth/screens/MyPageScreen"

const mockNavigate = jest.fn()
const mockGoBack = jest.fn()
const mockUpdateProfile = jest.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 10)))
const mockShowError = jest.fn()
const mockShowToast = jest.fn()

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}))

jest.mock("@core/providers/AppProvider", () => ({
  useAppAuth: () => ({
    currentUser: {
      id: "u1",
      name: "김지현",
      email: "test@test.com",
      password: "password",
    },
    updateProfile: mockUpdateProfile,
  }),
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    showError: mockShowError,
    showToast: mockShowToast,
  }),
}))

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

describe("MyPageScreen", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockGoBack.mockClear()
    mockUpdateProfile.mockClear()
    mockShowError.mockClear()
    mockShowToast.mockClear()
  })

  test("save blocks duplicate submit while request is pending", async () => {
    const { getAllByText } = render(<MyPageScreen />)

    const saveButton = getAllByText("저장")[0]
    fireEvent.press(saveButton)
    fireEvent.press(saveButton)

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1))
  })
})
