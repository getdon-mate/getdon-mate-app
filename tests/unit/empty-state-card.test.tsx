import { fireEvent, render } from "@testing-library/react-native"
import { EmptyStateCard } from "@features/accounts/components/EmptyStateCard"

describe("EmptyStateCard", () => {
  test("renders primary and secondary actions when provided", () => {
    const primary = jest.fn()
    const secondary = jest.fn()
    const { getByText } = render(
      <EmptyStateCard
        title="비어 있음"
        description="설명을 보여줍니다."
        actionLabel="복원"
        onAction={primary}
        secondaryActionLabel="전체 보기"
        onSecondaryAction={secondary}
      />
    )

    fireEvent.press(getByText("복원"))
    fireEvent.press(getByText("전체 보기"))

    expect(primary).toHaveBeenCalled()
    expect(secondary).toHaveBeenCalled()
  })
})
