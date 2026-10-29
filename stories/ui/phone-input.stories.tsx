import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { getCountries, type Value } from "react-phone-number-input"

import { PhoneInput } from "@/components/shared/forms/PhoneInput"

const meta = {
  title: "UI/PhoneInput",
  component: PhoneInput,
  args: { defaultCountry: "MX", "aria-label": "Teléfono" },
  render: function ControlledPhoneInput(args) {
    const [value, setValue] = useState<Value>()
    return (
      <div className="max-w-sm p-4">
        <PhoneInput {...args} value={value} onChange={setValue} />
        <output aria-label="Phone value">{value ?? ""}</output>
      </div>
    )
  },
} satisfies Meta<typeof PhoneInput>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Seleccionar país" })
    const phone = canvas.getByRole("textbox", { name: "Teléfono" })

    await step("Keep Mexico and phone value handling", async () => {
      await expect(trigger.querySelector("svg title")).toHaveTextContent("MX")
      await userEvent.type(phone, "5512345678")
      await expect(canvas.getByLabelText("Phone value")).toHaveTextContent(
        "+525512345678"
      )
      await userEvent.clear(phone)
      await expect(canvas.getByLabelText("Phone value")).toBeEmptyDOMElement()
    })

    await step(
      "Open all countries with a single selection indicator",
      async () => {
        await userEvent.click(trigger)
        await waitFor(() =>
          expect(body.getAllByRole("menuitemradio")).toHaveLength(
            getCountries().length
          )
        )
        const selected = body.getByRole("menuitemradio", { name: /Mexico/ })
        await expect(selected).toHaveAttribute("aria-checked", "true")
        await expect(selected).toHaveTextContent("+52")
        await expect(
          selected.querySelectorAll(".material-symbols-rounded")
        ).toHaveLength(1)
        await expect(
          selected.querySelector(".material-symbols-rounded")
        ).toBeVisible()
        await expect(
          body
            .getByRole("menuitemradio", { name: /Canada/ })
            .querySelector(".material-symbols-rounded")
        ).not.toBeVisible()
      }
    )

    await step(
      "Search, reset scroll, and recover from no results",
      async () => {
        const menu = body.getByRole("menu")
        menu.scrollTop = 800
        const search = body.getByPlaceholderText("Buscar pais...")
        await userEvent.type(search, "mex")
        await waitFor(() =>
          expect(body.getAllByRole("menuitemradio")).toHaveLength(1)
        )
        await expect(menu.scrollTop).toBe(0)
        await userEvent.clear(search)
        await userEvent.type(search, "zqqq")
        await expect(await body.findByText("No hay resultados.")).toBeVisible()
        await userEvent.clear(search)
        await waitFor(() =>
          expect(body.getAllByRole("menuitemradio")).toHaveLength(
            getCountries().length
          )
        )
        await userEvent.type(search, "mex")
        await userEvent.click(
          await body.findByRole("menuitemradio", { name: /Mexico/ })
        )
        await waitFor(() =>
          expect(body.queryByRole("menu")).not.toBeInTheDocument()
        )
        await waitFor(() => expect(trigger).toHaveFocus())
      }
    )

    await step(
      "Reopen, select by keyboard, and dismiss with Escape",
      async () => {
        await userEvent.click(trigger)
        const search = await body.findByPlaceholderText("Buscar pais...")
        await expect(search).toHaveValue("")
        await userEvent.type(search, "canada")
        await userEvent.keyboard("{ArrowDown}{Enter}")
        await waitFor(() =>
          expect(body.queryByRole("menu")).not.toBeInTheDocument()
        )
        await expect(trigger.querySelector("svg title")).toHaveTextContent("CA")
        await waitFor(() => expect(trigger).toHaveFocus())
        await userEvent.click(trigger)
        await userEvent.keyboard("{Escape}")
        await waitFor(() =>
          expect(body.queryByRole("menu")).not.toBeInTheDocument()
        )
        await waitFor(() => expect(trigger).toHaveFocus())
      }
    )
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Seleccionar país" })
    await expect(trigger).toBeDisabled()
    await expect(
      canvas.getByRole("textbox", { name: "Teléfono" })
    ).toBeDisabled()
    trigger.click()
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole("menu")
    ).not.toBeInTheDocument()
  },
}
