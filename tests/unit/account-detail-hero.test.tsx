import { fireEvent, render } from "@testing-library/react-native"
import { Share } from "react-native"
import { AccountDetailHero } from "@features/accounts/components/detail/AccountDetailHero"
import { defaultAccounts } from "@features/accounts/model/fixtures"

jest.mock("@shared/ui/primitives/Icon", () => ({
  Icon: ({ name }: { name: string }) => name,
}))

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(async () => undefined),
}))

describe("AccountDetailHero", () => {
  const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" } as never)

  beforeEach(() => {
    shareSpy.mockClear()
  })

  afterAll(() => {
    shareSpy.mockRestore()
  })

  test("supports copy and native share invite actions", () => {
    const onPressAction = jest.fn()
    const onCopyInvite = jest.fn(async () => undefined)

    const { getByLabelText } = render(
      <AccountDetailHero
        account={defaultAccounts[0]}
        onPressAction={onPressAction}
        maskAmounts={false}
        onToggleMask={jest.fn()}
        onCopyInvite={onCopyInvite}
        onShareInvite={shareSpy}
      />
    )

    fireEvent.press(getByLabelText("초대 링크 복사"))
    fireEvent.press(getByLabelText("모임통장 공유"))

    expect(onCopyInvite).toHaveBeenCalledTimes(1)
    expect(shareSpy).toHaveBeenCalledTimes(1)
  })

  test("renders a masked balance skeleton when privacy mode is enabled", () => {
    const { getByTestId, queryByText } = render(
      <AccountDetailHero
        account={defaultAccounts[0]}
        onPressAction={jest.fn()}
        maskAmounts
        onToggleMask={jest.fn()}
        onCopyInvite={jest.fn(async () => undefined)}
        onShareInvite={jest.fn(async () => undefined)}
      />
    )

    expect(getByTestId("masked-amount")).toBeTruthy()
    expect(queryByText(/1,850,000/)).toBeNull()
  })
})
