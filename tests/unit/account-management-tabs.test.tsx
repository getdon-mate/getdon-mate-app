import { fireEvent, render } from "@testing-library/react-native"
import { MembersTab } from "@features/accounts/components/detail-tabs/MembersTab"
import { SettingsTab } from "@features/accounts/components/detail-tabs/SettingsTab"
import { defaultAccounts } from "@features/accounts/model/fixtures"

const mockCurrentUser = {
  id: "u1",
  name: "다른이름",
  email: "test@test.com",
  password: "password",
}

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}))

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

jest.mock("@core/providers/AppProvider", () => ({
  useApp: () => ({
    createMember: jest.fn(async () => undefined),
    updateMember: jest.fn(async () => undefined),
    deleteMember: jest.fn(async () => undefined),
    updateAutoTransfer: jest.fn(async () => undefined),
    updateAccount: jest.fn(async () => undefined),
    createOneTimeDues: jest.fn(async () => undefined),
    updateOneTimeDues: jest.fn(async () => undefined),
    closeOneTimeDues: jest.fn(async () => undefined),
    deleteOneTimeDues: jest.fn(async () => undefined),
    toggleOneTimeDuesRecord: jest.fn(async () => undefined),
    deleteAccount: jest.fn(async () => undefined),
  }),
  useAppAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    showAlert: jest.fn(),
    showToast: jest.fn(),
    showError: jest.fn(),
    confirm: jest.fn(async () => true),
    confirmDanger: jest.fn(async () => true),
  }),
}))

describe("account management tabs", () => {
  test("settings draft resyncs when account prop changes", () => {
    const { getByDisplayValue, rerender } = render(<SettingsTab account={defaultAccounts[0]} />)

    expect(getByDisplayValue("개발자 스터디 모임")).toBeTruthy()

    rerender(<SettingsTab account={defaultAccounts[1]} />)

    expect(getByDisplayValue("주말 산악회")).toBeTruthy()
    expect(getByDisplayValue("3333-01-1234567")).toBeTruthy()
  })

  test("manager delegation visibility is based on linked userId, not display name", () => {
    const account = {
      ...defaultAccounts[0],
      members: defaultAccounts[0].members.map((member) =>
        member.id === "m1" ? { ...member, userId: "u1", name: "총무A" } : member
      ),
    }

    const { getAllByText } = render(<MembersTab account={account} />)

    expect(getAllByText("총무 위임").length).toBeGreaterThan(0)
  })
})
