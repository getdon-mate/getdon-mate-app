import { fireEvent, render } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
import { DayOfMonthSelectField } from "@shared/ui"
import { NumericInputField } from "@shared/ui"

describe("form primitives", () => {
  test("numeric input formats visible value while keeping raw digits", () => {
    function Wrapper() {
      const [value, setValue] = useState("")

      return (
        <View>
          <NumericInputField value={value} onChangeText={setValue} label="금액" placeholder="금액" />
        </View>
      )
    }

    const { getByLabelText } = render(<Wrapper />)
    const input = getByLabelText("금액")

    fireEvent.changeText(input, "12500")

    expect(input.props.value).toBe("12,500")
  })

  test("day-of-month select applies a value from the 1~28 list", () => {
    function Wrapper() {
      const [value, setValue] = useState("10")

      return (
        <View>
          <DayOfMonthSelectField value={value} onChangeValue={setValue} label="납부일" placeholder="1~28일 선택" />
        </View>
      )
    }

    const { getByLabelText, getByText } = render(<Wrapper />)

    fireEvent.press(getByLabelText("납부일 선택"))
    fireEvent.press(getByText("28일"))

    expect(getByText("28일")).toBeTruthy()
  })
})
