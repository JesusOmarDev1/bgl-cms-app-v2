import { describe, expect, it } from "vitest"

import { buildOrderDateFilter } from "@/services/domain/db/queries/collections/order/order-date-filter"

describe("order date filters", () => {
  it("converts one Mexico City calendar day to half-open UTC bounds", () => {
    expect(buildOrderDateFilter({ mode: "period", startDate: "2026-01-02" })).toEqual({
      date_created: {
        _gte: "2026-01-02T06:00:00.000Z",
        _lt: "2026-01-03T06:00:00.000Z",
      },
    })
  })

  it("includes both endpoints of an inclusive local date range", () => {
    expect(
      buildOrderDateFilter({
        mode: "period",
        startDate: "2026-01-02",
        endDate: "2026-01-04",
      })
    ).toEqual({
      date_created: {
        _gte: "2026-01-02T06:00:00.000Z",
        _lt: "2026-01-05T06:00:00.000Z",
      },
    })
  })

  it("uses the actual Mexico City offset across daylight-saving boundaries", () => {
    expect(
      buildOrderDateFilter({ mode: "period", startDate: "2021-04-04" })
    ).toEqual({
      date_created: {
        _gte: "2021-04-04T06:00:00.000Z",
        _lt: "2021-04-05T05:00:00.000Z",
      },
    })
  })

  it("matches selected specific days as discrete half-open ranges", () => {
    expect(
      buildOrderDateFilter({
        mode: "specific",
        dates: ["2026-01-02", "2026-01-05"],
      })
    ).toEqual({
      _or: [
        {
          date_created: {
            _gte: "2026-01-02T06:00:00.000Z",
            _lt: "2026-01-03T06:00:00.000Z",
          },
        },
        {
          date_created: {
            _gte: "2026-01-05T06:00:00.000Z",
            _lt: "2026-01-06T06:00:00.000Z",
          },
        },
      ],
    })
  })

  it.each(["2026-02-29", "2026-13-01", "2026-1-01", "not-a-date"])(
    "rejects invalid local calendar date %s",
    (date) => {
      expect(() =>
        buildOrderDateFilter({ mode: "period", startDate: date })
      ).toThrow(RangeError)
    }
  )

  it("rejects reversed ranges and empty specific-day selections", () => {
    expect(() =>
      buildOrderDateFilter({
        mode: "period",
        startDate: "2026-01-03",
        endDate: "2026-01-02",
      })
    ).toThrow(RangeError)
    expect(() => buildOrderDateFilter({ mode: "specific", dates: [] })).toThrow(
      RangeError
    )
  })
})
