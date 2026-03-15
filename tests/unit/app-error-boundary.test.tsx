import { fireEvent, render } from "@testing-library/react-native"
import { AppErrorBoundary } from "@core/errors/AppErrorBoundary"
import { logger } from "@shared/lib/logger"

function Crash() {
  throw new Error("테스트 에러")
}

describe("AppErrorBoundary", () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)
  const loggerErrorSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined)

  beforeEach(() => {
    loggerErrorSpy.mockClear()
    Object.defineProperty(globalThis, "location", {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
    loggerErrorSpy.mockRestore()
  })

  test("uses browser refresh copy when reload is available", () => {
    const reload = jest.fn()
    Object.defineProperty(globalThis, "location", {
      value: { reload },
      configurable: true,
      writable: true,
    })

    const { getByText } = render(
      <AppErrorBoundary>
        <Crash />
      </AppErrorBoundary>
    )

    fireEvent.press(getByText("브라우저 새로고침"))

    expect(reload).toHaveBeenCalledTimes(1)
  })

  test("shows safe native recovery copy when reload is unavailable", () => {
    const { getByText, queryByText } = render(
      <AppErrorBoundary>
        <Crash />
      </AppErrorBoundary>
    )

    expect(getByText("앱 상태 초기화")).toBeTruthy()
    expect(queryByText("브라우저 새로고침")).toBeNull()
  })
})
