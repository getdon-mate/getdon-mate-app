import { fireEvent, render } from "@testing-library/react-native"
import { getUnreadActionLabel, NotificationListScreen } from "@features/auth/screens/NotificationListScreen"

const mockGoBack = jest.fn()
const mockMarkAll = jest.fn(async () => undefined)
const mockClear = jest.fn(async () => undefined)
const mockRestore = jest.fn(async () => undefined)
const mockRead = jest.fn(async () => undefined)

let mockRuntimeNotifications = [
  {
    id: "notice-reminder",
    title: "납부 안내를 보냈어요",
    body: "박소연님에게 2026-03 회비 납부 안내를 전송했습니다.",
    time: "방금 전",
    unread: true,
  },
  {
    id: "notice-board",
    title: "모임 공지가 등록됐어요",
    body: "이번 주 장소 변경 공지를 확인해보세요.",
    time: "10분 전",
    unread: false,
  },
  {
    id: "notice-transaction",
    title: "생활비 통장에 입금이 반영됐어요",
    body: "김토스님이 50,000원을 채웠습니다.",
    time: "어제",
    unread: true,
  },
]

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}))

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

jest.mock("@core/providers/AppProvider", () => ({
  useAppRuntime: () => ({
    notifications: mockRuntimeNotifications,
    unreadNotificationCount: mockRuntimeNotifications.filter((item) => item.unread).length,
    markAllNotificationsRead: mockMarkAll,
    clearNotifications: mockClear,
    restoreNotifications: mockRestore,
    markNotificationRead: mockRead,
  }),
}))

describe("NotificationListScreen", () => {
  beforeEach(() => {
    mockRuntimeNotifications = [
      {
        id: "notice-reminder",
        title: "납부 안내를 보냈어요",
        body: "박소연님에게 2026-03 회비 납부 안내를 전송했습니다.",
        time: "방금 전",
        unread: true,
      },
      {
        id: "notice-board",
        title: "모임 공지가 등록됐어요",
        body: "이번 주 장소 변경 공지를 확인해보세요.",
        time: "10분 전",
        unread: false,
      },
      {
        id: "notice-transaction",
        title: "생활비 통장에 입금이 반영됐어요",
        body: "김토스님이 50,000원을 채웠습니다.",
        time: "어제",
        unread: true,
      },
    ]
    mockGoBack.mockClear()
    mockMarkAll.mockClear()
    mockClear.mockClear()
    mockRestore.mockClear()
    mockRead.mockClear()
  })

  test("renders filter chips and narrows to reminder notifications", () => {
    const { getByText, getByLabelText, queryByText } = render(<NotificationListScreen />)

    expect(getByText("중요한 안내만 빠르게 확인하세요.")).toBeTruthy()
    expect(getByText("전체")).toBeTruthy()
    expect(getByText("읽지 않음")).toBeTruthy()
    expect(getByLabelText("알림 필터 안내")).toBeTruthy()
    expect(getByLabelText("알림 필터 공지")).toBeTruthy()

    fireEvent.press(getByLabelText("알림 필터 안내"))

    expect(getByText("안내만 보고 있어요.")).toBeTruthy()
    expect(getByText("납부 안내를 보냈어요")).toBeTruthy()
    expect(queryByText("모임 공지가 등록됐어요")).toBeNull()
    expect(queryByText("생활비 통장에 입금이 반영됐어요")).toBeNull()
  })

  test("unread filter hides read notifications", () => {
    const { getByText, getByLabelText, queryByText } = render(<NotificationListScreen />)

    fireEvent.press(getByLabelText("알림 필터 읽지 않음"))

    expect(getByText("납부 안내를 보냈어요")).toBeTruthy()
    expect(queryByText("모임 공지가 등록됐어요")).toBeNull()
  })

  test("header clear action calls runtime clearNotifications", () => {
    const { getByRole } = render(<NotificationListScreen />)

    fireEvent.press(getByRole("button", { name: "비우기" }))

    expect(mockClear).toHaveBeenCalled()
  })

  test("unread action uses a more specific accessibility label", () => {
    const { getByRole } = render(<NotificationListScreen />)

    fireEvent.press(getByRole("button", { name: "납부 안내를 보냈어요 읽음 처리" }))

    expect(mockRead).toHaveBeenCalledWith("notice-reminder")
  })

  test("filtered empty state offers a quick reset back to all notifications", () => {
    mockRuntimeNotifications = mockRuntimeNotifications.filter((item) => item.id !== "notice-board")
    const { getByLabelText, getByText, queryByText } = render(<NotificationListScreen />)

    fireEvent.press(getByLabelText("알림 필터 공지"))

    expect(getByText("맞는 알림이 없습니다.")).toBeTruthy()
    expect(getByText("전체 보기")).toBeTruthy()
    expect(queryByText("납부 안내를 보냈어요")).toBeNull()

    fireEvent.press(getByText("전체 보기"))

    expect(getByText("납부 안내를 보냈어요")).toBeTruthy()
  })

  test("empty notification state can restore the sample feed", () => {
    mockRuntimeNotifications = []
    const { getByText } = render(<NotificationListScreen />)

    expect(getByText("표시할 알림이 없습니다.")).toBeTruthy()

    fireEvent.press(getByText("샘플 알림 복원"))

    expect(mockRestore).toHaveBeenCalled()
  })

  test("narrow screens shorten the unread action label", () => {
    expect(getUnreadActionLabel(380)).toBe("읽음")
    expect(getUnreadActionLabel(430)).toBe("읽음 처리")
  })
})
