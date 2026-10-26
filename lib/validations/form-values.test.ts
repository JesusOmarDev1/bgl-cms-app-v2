import { describe, expect, it } from "vitest"
import * as v from "valibot"
import {
  buildFormValuesSchema,
  type ExpandedFormField,
} from "@/lib/validations/form-values"

const messages = {
  required: "required",
  maxLength: "max",
  email: "email",
  phone: "phone",
  date: "date",
  datetime: "datetime",
  number: "number",
  checkbox: "checkbox",
  minValue: (min: number) => `min ${min}`,
  maxValue: (max: number) => `max ${max}`,
}

const field = (collection: ExpandedFormField["collection"], item: object) =>
  ({ id: 1, sort: null, collection, item }) as unknown as ExpandedFormField

describe("buildFormValuesSchema", () => {
  it("enforces the shared text limit and strips unknown keys", () => {
    const schema = buildFormValuesSchema(
      [
        field("text_area_block", { identifier: "message", required: false }),
        field("email_block", { identifier: "email", required: false }),
      ],
      messages
    )

    expect(
      v.safeParse(schema, { message: "a".repeat(255), email: "" }).success
    ).toBe(true)
    expect(
      v.safeParse(schema, { message: "a".repeat(256), email: "" }).success
    ).toBe(false)
    expect(
      v.safeParse(schema, { message: "ok", email: "", extra: "ignored" })
    ).toEqual({
      issues: undefined,
      typed: true,
      success: true,
      output: { message: "ok", email: "" },
    })
    expect(
      v.safeParse(schema, {
        message: "ok",
        email: `${"a".repeat(250)}@example.com`,
      }).success
    ).toBe(false)
  })

  it("rejects invalid dates and non-finite numbers", () => {
    const schema = buildFormValuesSchema(
      [
        field("date_block", {
          identifier: "date",
          required: true,
          hours: false,
        }),
        field("date_block", {
          identifier: "datetime",
          required: true,
          hours: true,
        }),
        field("number_block", {
          identifier: "amount",
          required: true,
        }),
      ],
      messages
    )

    expect(
      v.safeParse(schema, {
        date: "2026-02-30",
        datetime: "2026-02-28T23:59",
        amount: 1,
      }).success
    ).toBe(false)
    expect(
      v.safeParse(schema, {
        date: "2026-02-28",
        datetime: "2026-02-28T24:00",
        amount: 1,
      }).success
    ).toBe(false)
    expect(
      v.safeParse(schema, {
        date: "2026-02-28",
        datetime: "2026-02-28T23:59",
        amount: Infinity,
      }).success
    ).toBe(false)
    expect(
      v.safeParse(schema, {
        date: "2026-02-28",
        datetime: "2026-02-28T23:59",
        amount: 1,
      }).success
    ).toBe(true)
  })
})
