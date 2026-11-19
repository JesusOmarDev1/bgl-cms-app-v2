import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { readOrderSort } from "./page"

describe("order sort URL parameters", () => {
  it("reads whitelisted field and direction without consuming other filters", () => {
    expect(
      readOrderSort({
        sortBy: "folio",
        sortDirection: "asc",
        page: "4",
        status: "paid",
        q: "calibración",
        from: "2026-01-01",
      })
    ).toEqual({ sortBy: "folio", sortDirection: "asc" })
  })

  it.each([
    {
      params: { sortDirection: "asc" },
      expected: { sortBy: "date_created", sortDirection: "asc" },
    },
    {
      params: { sortBy: "folio" },
      expected: { sortBy: "folio", sortDirection: "desc" },
    },
  ])("defaults only the omitted sort component %#", ({ params, expected }) => {
    expect(readOrderSort(params)).toEqual(expected)
  })

  it.each([
    {
      params: { sortBy: "status", sortDirection: "asc" },
      expected: { sortBy: "date_created", sortDirection: "asc" },
    },
    {
      params: { sortBy: "folio,id", sortDirection: "asc" },
      expected: { sortBy: "date_created", sortDirection: "asc" },
    },
    {
      params: { sortBy: ["folio", "date_created"], sortDirection: "asc" },
      expected: { sortBy: "date_created", sortDirection: "asc" },
    },
    {
      params: { sortBy: "folio", sortDirection: "sideways" },
      expected: { sortBy: "folio", sortDirection: "desc" },
    },
    {
      params: { sortBy: "folio", sortDirection: ["asc", "desc"] },
      expected: { sortBy: "folio", sortDirection: "desc" },
    },
  ])(
    "defaults only an invalid or repeated sort component %#",
    ({ params, expected }) => {
      expect(readOrderSort(params)).toEqual(expected)
    }
  )

  it("uses the established default when sort parameters are absent", () => {
    expect(readOrderSort({ page: "2", status: "draft" })).toEqual({
      sortBy: "date_created",
      sortDirection: "desc",
    })
  })
})
