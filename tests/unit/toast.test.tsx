import { render } from "@testing-library/react-native"
import { Toast } from "@shared/ui"

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

describe("Toast", () => {
  test("renders compact floating toast with message", () => {
    const { getByText, getByTestId } = render(
      <Toast visible title="저장 완료" message="변경 내용을 반영했습니다." tone="success" />
    )

    expect(getByText("저장 완료")).toBeTruthy()
    expect(getByText("변경 내용을 반영했습니다.")).toBeTruthy()

    const wrap = getByTestId("toast-wrap")
    expect(wrap).toHaveStyle({
      position: "absolute",
      alignSelf: "center",
      width: "auto",
      maxWidth: 360,
      bottom: 20,
    })
  })

  test("does not render message node when message is omitted", () => {
    const { getByText, queryByTestId } = render(<Toast visible title="알림" tone="info" />)

    expect(getByText("알림")).toBeTruthy()
    expect(queryByTestId("toast-message")).toBeNull()
  })
})
