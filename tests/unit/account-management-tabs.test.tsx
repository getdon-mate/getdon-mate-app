import { fireEvent, render } from "@testing-library/react-native"
import { DetailTabBar } from "@features/accounts/components/detail/DetailTabBar"
import { BoardTab } from "@features/accounts/components/detail-tabs/BoardTab"
import { CalendarTab } from "@features/accounts/components/detail-tabs/CalendarTab"
import { DuesTab } from "@features/accounts/components/detail-tabs/DuesTab"
import { MembersTab } from "@features/accounts/components/detail-tabs/MembersTab"
import { SettingsTab } from "@features/accounts/components/detail-tabs/SettingsTab"
import { StatisticsTab } from "@features/accounts/components/detail-tabs/StatisticsTab"
import { TransactionsTab } from "@features/accounts/components/detail-tabs/TransactionsTab"
import { defaultAccounts } from "@features/accounts/model/fixtures"

const mockCurrentUser = {
  id: "u1",
  name: "다른이름",
  email: "test@test.com",
  password: "password",
}

const mockSendPaymentReminder = jest.fn(async () => undefined)
const mockSendTransferRequest = jest.fn(async () => undefined)

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
    sendPaymentReminder: mockSendPaymentReminder,
    sendTransferRequest: mockSendTransferRequest,
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
  beforeEach(() => {
    mockSendPaymentReminder.mockClear()
    mockSendTransferRequest.mockClear()
  })

  test("detail tab bar exposes statistics calendar and board tabs", () => {
    const { getByText } = render(<DetailTabBar activeTab="dashboard" onChangeTab={jest.fn()} />)

    expect(getByText("통계")).toBeTruthy()
    expect(getByText("일정")).toBeTruthy()
    expect(getByText("게시판")).toBeTruthy()
  })

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

  test("transaction filters stay collapsed until the filter icon is pressed", () => {
    const { queryByLabelText, getByLabelText } = render(<TransactionsTab account={defaultAccounts[0]} />)

    expect(queryByLabelText("거래 검색")).toBeNull()

    fireEvent.press(getByLabelText("거래 필터 열기"))

    expect(getByLabelText("거래 검색")).toBeTruthy()
  })

  test("dues tab can send a friendly payment reminder to unpaid members", () => {
    const { getAllByText } = render(
      <DuesTab account={defaultAccounts[0]} selectedMonth="2026-03" onSelectMonth={jest.fn()} />
    )

    fireEvent.press(getAllByText("납부 안내")[0])

    expect(mockSendPaymentReminder).toHaveBeenCalledWith("acc1", "m3", "2026-03")
  })

  test("members tab can send a transfer request for unpaid members", () => {
    const { getAllByText } = render(<MembersTab account={defaultAccounts[0]} />)

    fireEvent.press(getAllByText("송금 요청")[0])

    expect(mockSendTransferRequest).toHaveBeenCalledWith("acc1", "m3", "2026-03")
  })

  test("members tab surfaces the latest reminder context for unpaid members", () => {
    const { getByText } = render(<MembersTab account={defaultAccounts[0]} />)

    expect(getByText(/최근 안내/)).toBeTruthy()
  })

  test("calendar tab can move between months and focus matching events", () => {
    const { getAllByText, getByLabelText, getByText } = render(<CalendarTab account={defaultAccounts[0]} />)

    expect(getByText("2026년 3월")).toBeTruthy()

    fireEvent.press(getByLabelText("이전 달 보기"))

    expect(getByText("2026년 2월")).toBeTruthy()
    expect(getAllByText("개발자 스터디 모임 2026-02 회비 완료").length).toBeGreaterThan(0)
  })

  test("board tab empty state uses shorter posting copy", () => {
    const emptyBoardAccount = {
      ...defaultAccounts[0],
      boardPosts: [],
    }

    const { getByText } = render(<BoardTab account={emptyBoardAccount} />)

    expect(getByText("첫 공지를 남겨보세요.")).toBeTruthy()
    expect(getByText("운영 소식은 짧게 바로 올릴 수 있습니다.")).toBeTruthy()
  })

  test("statistics tab empty state uses shorter operational copy", () => {
    const emptyStatsAccount = {
      ...defaultAccounts[0],
      transactions: [],
    }

    const { getByText } = render(<StatisticsTab account={emptyStatsAccount} />)

    expect(getByText("아직 집계할 거래가 없습니다.")).toBeTruthy()
    expect(getByText("거래가 쌓이면 흐름을 여기서 보여줍니다.")).toBeTruthy()
    expect(getByText("출금 내역이 아직 없습니다.")).toBeTruthy()
    expect(getByText("지출이 생기면 비중을 바로 보여줍니다.")).toBeTruthy()
  })
})
