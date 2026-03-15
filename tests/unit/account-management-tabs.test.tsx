import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { DetailTabBar } from "@features/accounts/components/detail/DetailTabBar"
import { DashboardTab } from "@features/accounts/components/detail-tabs/DashboardTab"
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
const mockDelegateManager = jest.fn(async () => undefined)
const mockCreateMember = jest.fn(async () => undefined)
const mockCreateTransaction = jest.fn(async () => undefined)
const mockUpdateTransaction = jest.fn(async () => undefined)
const mockDeleteTransaction = jest.fn(async () => undefined)
const mockCreateBoardPost = jest.fn(async () => undefined)
const mockAddBoardComment = jest.fn(async () => undefined)
const mockShowToast = jest.fn()
const mockConfirm = jest.fn(async () => true)
const mockOpenCalendarQuickAction = jest.fn()
let mockIsMutating = false

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
    createMember: mockCreateMember,
    updateMember: jest.fn(async () => undefined),
    deleteMember: jest.fn(async () => undefined),
    delegateManager: mockDelegateManager,
    updateAutoTransfer: jest.fn(async () => undefined),
    updateAccount: jest.fn(async () => undefined),
    createOneTimeDues: jest.fn(async () => undefined),
    updateOneTimeDues: jest.fn(async () => undefined),
    closeOneTimeDues: jest.fn(async () => undefined),
    deleteOneTimeDues: jest.fn(async () => undefined),
    toggleOneTimeDuesRecord: jest.fn(async () => undefined),
    deleteAccount: jest.fn(async () => undefined),
    createTransaction: mockCreateTransaction,
    updateTransaction: mockUpdateTransaction,
    deleteTransaction: mockDeleteTransaction,
    sendPaymentReminder: mockSendPaymentReminder,
    sendTransferRequest: mockSendTransferRequest,
    createBoardPost: mockCreateBoardPost,
    addBoardComment: mockAddBoardComment,
    isMutating: mockIsMutating,
  }),
  useAppAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}))

jest.mock("@core/providers/FeedbackProvider", () => ({
  useFeedback: () => ({
    showAlert: jest.fn(),
    showToast: mockShowToast,
    showError: jest.fn(),
    confirm: mockConfirm,
    confirmDanger: jest.fn(async () => true),
  }),
}))

describe("account management tabs", () => {
  beforeEach(() => {
    mockSendPaymentReminder.mockClear()
    mockSendTransferRequest.mockClear()
    mockDelegateManager.mockClear()
    mockCreateMember.mockClear()
    mockCreateTransaction.mockClear()
    mockUpdateTransaction.mockClear()
    mockDeleteTransaction.mockClear()
    mockCreateBoardPost.mockClear()
    mockAddBoardComment.mockClear()
    mockShowToast.mockClear()
    mockConfirm.mockClear()
    mockOpenCalendarQuickAction.mockClear()
    mockIsMutating = false
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

  test("dues tab supports sending reminders to all unpaid members at once", () => {
    const { getByText } = render(
      <DuesTab account={defaultAccounts[0]} selectedMonth="2026-03" onSelectMonth={jest.fn()} />
    )

    fireEvent.press(getByText("미납 전체 안내"))

    expect(mockSendPaymentReminder).toHaveBeenCalledWith("acc1", "m3", "2026-03")
    expect(mockSendPaymentReminder).toHaveBeenCalledWith("acc1", "m4", "2026-03")
  })

  test("dues tab distinguishes empty month records from an account without members", () => {
    const noRecordAccount = {
      ...defaultAccounts[0],
      duesRecords: defaultAccounts[0].duesRecords.filter((record) => record.month !== "2026-03"),
    }
    const noMemberAccount = {
      ...defaultAccounts[0],
      members: [],
      duesRecords: [],
    }

    const { getByText, rerender } = render(
      <DuesTab account={noRecordAccount} selectedMonth="2026-03" onSelectMonth={jest.fn()} />
    )

    expect(getByText("이 달의 회비 기록이 없습니다.")).toBeTruthy()

    rerender(<DuesTab account={noMemberAccount} selectedMonth="2026-03" onSelectMonth={jest.fn()} />)

    expect(getByText("먼저 멤버를 추가해보세요.")).toBeTruthy()
  })

  test("dues tab surfaces the latest reminder context for unpaid members", () => {
    const { getByText } = render(
      <DuesTab account={defaultAccounts[0]} selectedMonth="2026-03" onSelectMonth={jest.fn()} />
    )

    expect(getByText("최근 안내 · 3월 7일 납부 안내")).toBeTruthy()
  })

  test("dues tab supports direct month switching from the month chips", () => {
    const onSelectMonth = jest.fn()
    const { getByText } = render(<DuesTab account={defaultAccounts[0]} selectedMonth="2026-03" onSelectMonth={onSelectMonth} />)

    fireEvent.press(getByText("2월"))

    expect(onSelectMonth).toHaveBeenCalledWith("2026-02")
  })

  test("members tab can send a transfer request for unpaid members", async () => {
    const { getAllByText } = render(<MembersTab account={defaultAccounts[0]} />)

    fireEvent.press(getAllByText("송금 요청")[0])

    expect(mockSendTransferRequest).toHaveBeenCalledWith("acc1", "m3", "2026-03")
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "송금 요청 전송",
          message: "박소연님께 바로 납부할 수 있도록 요청을 보냈습니다.",
        })
      )
    )
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

  test("calendar tab exposes quick entry actions for schedule-related work", () => {
    const { getByRole } = render(
      <CalendarTab account={defaultAccounts[0]} onOpenQuickAction={mockOpenCalendarQuickAction} />
    )

    fireEvent.press(getByRole("button", { name: "공지 일정 열기" }))

    expect(mockOpenCalendarQuickAction).toHaveBeenCalledWith("board")
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

  test("board tab shows a loading skeleton before the first post arrives", () => {
    mockIsMutating = true
    const emptyBoardAccount = {
      ...defaultAccounts[0],
      boardPosts: [],
    }

    const { getAllByTestId } = render(<BoardTab account={emptyBoardAccount} />)

    expect(getAllByTestId("loading-state-card").length).toBeGreaterThan(0)
  })

  test("board tab can apply a notice template into the composer", () => {
    const { getByText, getByDisplayValue } = render(<BoardTab account={defaultAccounts[0]} />)

    fireEvent.press(getByText("회비 안내"))

    expect(getByDisplayValue("이번 달 회비 안내")).toBeTruthy()
    expect(getByDisplayValue("마감일 전까지 회비를 확인해주세요. 필요한 내용은 댓글로 남겨주세요.")).toBeTruthy()
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

  test("statistics tab can focus a single month from the period chips", () => {
    const { getByText, queryByText } = render(<StatisticsTab account={defaultAccounts[0]} />)

    fireEvent.press(getByText("2026년 2월"))

    expect(getByText("선택 기간 · 2026년 2월")).toBeTruthy()
    expect(queryByText("2026년 3월")).toBeNull()
  })

  test("statistics tab can focus a single category from the breakdown rows", () => {
    const { getByText } = render(<StatisticsTab account={defaultAccounts[0]} />)

    fireEvent.press(getByText("장소"))

    expect(getByText("선택 카테고리 · 장소")).toBeTruthy()
    expect(getByText("해당 카테고리 지출 53%")).toBeTruthy()
  })

  test("calendar tab summarizes the selected date event count", () => {
    const { getByLabelText, getByText } = render(<CalendarTab account={defaultAccounts[0]} />)

    fireEvent.press(getByLabelText("2026-03-04 일정 보기"))

    expect(getByText("선택 일정 2건")).toBeTruthy()
  })

  test("board tab separates pinned notices with a badge", () => {
    const { getAllByText } = render(<BoardTab account={defaultAccounts[0]} />)

    expect(getAllByText("공지").length).toBeGreaterThan(0)
  })

  test("members tab empty state uses shorter filter-reset copy", () => {
    const { getByText, getByLabelText } = render(<MembersTab account={defaultAccounts[0]} />)

    fireEvent.changeText(getByLabelText("멤버 검색"), "없는이름")

    expect(getByText("조건에 맞는 멤버가 없습니다.")).toBeTruthy()
    expect(getByText("필터를 바꾸거나 멤버를 추가해보세요.")).toBeTruthy()
    expect(getByText("검색 초기화")).toBeTruthy()
  })

  test("members tab explains why the current manager cannot be deleted", () => {
    const { getByText } = render(<MembersTab account={defaultAccounts[0]} />)

    expect(getByText("현재 총무는 삭제할 수 없어요.")).toBeTruthy()
  })

  test("members tab uses explicit confirmation copy for manager delegation", async () => {
    const { getAllByText } = render(<MembersTab account={defaultAccounts[0]} />)

    fireEvent.press(getAllByText("총무 위임")[0])

    await waitFor(() =>
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "총무 위임",
        })
      )
    )
  })

  test("members tab can narrow results by role and sort alphabetically", () => {
    const { getByText, getByLabelText, queryByText } = render(<MembersTab account={defaultAccounts[0]} />)

    fireEvent.press(getByText("총무"))
    expect(getByText("김지현")).toBeTruthy()
    expect(queryByText("이승우")).toBeNull()

    fireEvent.press(getByText("전체"))
    fireEvent.press(getByText("이름순"))
    fireEvent.changeText(getByLabelText("멤버 검색"), "010-2345")

    expect(getByText("이승우")).toBeTruthy()
    expect(queryByText("박소연")).toBeNull()
  })

  test("dashboard tab recent transaction empty state routes back into the transaction tab", () => {
    const noTransactionAccount = {
      ...defaultAccounts[0],
      transactions: [],
    }
    const onOpenTransactions = jest.fn()
    const { getByText } = render(
      <DashboardTab account={noTransactionAccount} onOpenDues={jest.fn()} onOpenTransactions={onOpenTransactions} />
    )

    fireEvent.press(getByText("거래 열기"))

    expect(onOpenTransactions).toHaveBeenCalled()
  })

  test("members tab validates phone number format before submit", async () => {
    const { getByDisplayValue, getByRole, getByText, getByPlaceholderText } = render(<MembersTab account={defaultAccounts[0]} />)

    fireEvent.changeText(getByPlaceholderText("멤버 이름"), "새 멤버")
    fireEvent.changeText(getByPlaceholderText("010-0000-0000"), "010")
    fireEvent.press(getByRole("button", { name: "멤버 추가" }))

    expect(getByText("연락처 형식을 확인해주세요.")).toBeTruthy()
    expect(mockCreateMember).not.toHaveBeenCalled()
    expect(getByDisplayValue("010")).toBeTruthy()
  })

  test("transactions tab distinguishes empty search results from an empty ledger", () => {
    const { getByLabelText, getByText } = render(<TransactionsTab account={defaultAccounts[0]} />)

    fireEvent.press(getByLabelText("거래 필터 열기"))
    fireEvent.changeText(getByLabelText("거래 검색"), "없는 거래")

    expect(getByText("조건에 맞는 거래가 없습니다.")).toBeTruthy()
    expect(getByText("검색어나 필터를 조정하면 다시 거래를 볼 수 있습니다.")).toBeTruthy()
    expect(getByText("필터 초기화")).toBeTruthy()
  })

  test("transactions tab shows a loading skeleton before the first transaction arrives", () => {
    mockIsMutating = true
    const emptyTransactionsAccount = {
      ...defaultAccounts[0],
      transactions: [],
    }

    const { getAllByTestId } = render(<TransactionsTab account={emptyTransactionsAccount} />)

    expect(getAllByTestId("loading-state-card").length).toBeGreaterThan(0)
  })

  test("transactions tab can apply recent category suggestions to the composer", () => {
    const { getByText, getByDisplayValue } = render(<TransactionsTab account={defaultAccounts[0]} />)

    fireEvent.press(getByText("간식"))

    expect(getByDisplayValue("간식")).toBeTruthy()
  })

  test("transactions tab can apply recent value suggestions to the composer", () => {
    const { getByText, getByDisplayValue } = render(<TransactionsTab account={defaultAccounts[0]} initialType="expense" />)

    fireEvent.press(getByText("간식 구매 · 12,500원"))

    expect(getByDisplayValue("12500")).toBeTruthy()
    expect(getByDisplayValue("간식 구매")).toBeTruthy()
    expect(getByDisplayValue("간식")).toBeTruthy()
  })

  test("transactions tab uses specific delete feedback copy", async () => {
    const { getAllByText } = render(<TransactionsTab account={defaultAccounts[0]} />)

    fireEvent.press(getAllByText("삭제")[0])

    await waitFor(() => expect(mockDeleteTransaction).toHaveBeenCalledWith("acc1", "t1"))
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "삭제 완료",
          message: "3월 회비 거래를 제거했습니다.",
        })
      )
    )
  })
})
