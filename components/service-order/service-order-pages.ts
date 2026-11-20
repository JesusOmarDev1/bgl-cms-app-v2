import { money } from "@/lib/formatting/money"

import type {
  serviceOrderAmounts,
  ServiceOrderData,
} from "./service-order-helpers"

export type ServiceOrderEquipmentBox = {
  brand: string
  model: string
  serial: string
  capacity: string
}

export type ServiceOrderPartsLine = {
  quantity: string
  description: string
  unitPrice: string
  amount: string
}

/** One explicit letter page of a multipage order. */
export type ServiceOrderPage = {
  description: string[]
  equipment: ServiceOrderEquipmentBox[]
  parts: ServiceOrderPartsLine[]
  /** Measured content height in points; `serviceOrderPages` keeps it in budget. */
  height: number
}

export const EMPTY_EQUIPMENT_BOX: ServiceOrderEquipmentBox = {
  brand: "",
  model: "",
  serial: "",
  capacity: "",
}

export const EMPTY_PARTS_LINE: ServiceOrderPartsLine = {
  quantity: "",
  description: "",
  unitPrice: "",
  amount: "",
}

/*
 * US Letter vertical budget in points, from the sheet rendered in T1: 792 =
 * 18 padding + 86 header + 92 fields + 143 description + 108 equipment +
 * 128 parts + 111 signatures/totals + 30 logos + 76 footer. The remaining
 * costs are blocks measured on the rendered PDF that continuation pages pack
 * against; `.so-section-bar` carries its 8pt margin here.
 */
export const PAGE_BUDGET = {
  height: 792,
  padding: 18,
  header: 86,
  fields: 92,
  description: 143,
  equipment: 108,
  parts: 128,
  signatures: 111,
  logos: 30,
  footer: 76,
  bar: 26,
  descriptionLine: 12.15,
  descriptionPadding: 16,
  equipmentRow: 62,
  equipmentGap: 6,
  equipmentCellLine: 13.5,
  partsHead: 13,
  partsRow: 21,
  partsRowLine: 13.5,
} as const

/*
 * Text budgets measured on the rendered sheet: printed columns fit this many
 * Arial characters per line, and these are the lines each block is sized for.
 * Longer content is never clipped — it grows its block and pagination moves it
 * whole to another page (the description flows line by line).
 */
export const TEXT_BUDGET = {
  description: { charsPerLine: 100 },
  equipment: { charsPerLine: 7, linesPerBox: 3 },
  parts: { charsPerLine: 40, linesPerRow: 2 },
} as const

// Body left by header, logos and footer: 792 − 18 − 86 − 30 − 76 = 582pt.
const BODY =
  PAGE_BUDGET.height -
  PAGE_BUDGET.padding -
  PAGE_BUDGET.header -
  PAGE_BUDGET.logos -
  PAGE_BUDGET.footer

const firstPageEquipmentRows = Math.floor(
  (PAGE_BUDGET.equipment - PAGE_BUDGET.bar) / PAGE_BUDGET.equipmentRow
)

/** Measured first-page capacity of the fixed single-page blocks. */
export const FIRST_PAGE_CAPACITY = {
  descriptionLines: Math.floor(
    (PAGE_BUDGET.description -
      PAGE_BUDGET.bar -
      PAGE_BUDGET.descriptionPadding) /
      PAGE_BUDGET.descriptionLine
  ),
  equipmentRows: firstPageEquipmentRows,
  equipment: firstPageEquipmentRows * 2,
  partsRows: Math.floor(
    (PAGE_BUDGET.parts - PAGE_BUDGET.bar - PAGE_BUDGET.partsHead) /
      PAGE_BUDGET.partsRow
  ),
} as const

/**
 * Word-wraps description text to `chars` per line, keeping explicit line
 * breaks. A word longer than a line is split like `overflow-wrap` does, so the
 * page model and Chromium wrap in the same place.
 */
export function wrapServiceOrderText(text: string, chars: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ").filter(Boolean)
    if (!words.length) {
      lines.push("")
      continue
    }
    let line = ""
    for (const word of words) {
      const fits = line ? line.length + 1 + word.length <= chars : false
      if (fits || (!line && word.length <= chars)) {
        line = line ? `${line} ${word}` : word
        continue
      }
      if (line) lines.push(line)
      let rest = word
      while (rest.length > chars) {
        lines.push(rest.slice(0, chars))
        rest = rest.slice(chars)
      }
      line = rest
    }
    if (line) lines.push(line)
  }
  while (lines.length && !lines.at(-1)) lines.pop()
  return lines
}

export function equipmentBoxes(
  data: ServiceOrderData
): ServiceOrderEquipmentBox[] {
  return data.scales.map(({ scales_id: scale }) => ({
    brand: scale.brand.title,
    model: scale.model?.title ?? "",
    serial: scale.serial_number ?? "",
    capacity: `${scale.capacity} ${scale.units}`,
  }))
}

export function partsLines(
  data: ServiceOrderData,
  amounts: ReturnType<typeof serviceOrderAmounts> | null,
  showPrices: boolean
): ServiceOrderPartsLine[] {
  return data.parts.map((part, index) => ({
    quantity: String(part.quantity),
    description: part.inventory_id.title,
    unitPrice: showPrices ? money(amounts?.lines[index].price ?? null) : "",
    amount: showPrices ? money(amounts?.lines[index].amount ?? null) : "",
  }))
}

const lineCount = (text: string, chars: number) =>
  Math.max(1, wrapServiceOrderText(text, chars).length)

/** One equipment row holds two boxes; the row is as tall as its tallest box. */
function equipmentHeight(boxes: ServiceOrderEquipmentBox[]): number {
  const extraLines = Math.max(
    ...boxes.map(
      (box) =>
        Math.max(
          ...([box.brand, box.model, box.serial, box.capacity] as const).map(
            (value) => lineCount(value, TEXT_BUDGET.equipment.charsPerLine)
          )
        ) - TEXT_BUDGET.equipment.linesPerBox
    )
  )
  return (
    PAGE_BUDGET.equipmentRow +
    Math.max(0, extraLines) * PAGE_BUDGET.equipmentCellLine
  )
}

function partsHeight(line: ServiceOrderPartsLine): number {
  return (
    PAGE_BUDGET.partsRow +
    Math.max(
      0,
      lineCount(line.description, TEXT_BUDGET.parts.charsPerLine) -
        TEXT_BUDGET.parts.linesPerRow
    ) *
      PAGE_BUDGET.partsRowLine
  )
}

type Atom =
  | { kind: "description"; line: string; height: number }
  | { kind: "equipment"; boxes: ServiceOrderEquipmentBox[]; height: number }
  | { kind: "parts"; line: ServiceOrderPartsLine; height: number }

type PackedPage = { atoms: Atom[]; height: number }

// A section opened on a page also pays for its bar (and the table header).
const openingCost = (kind: Atom["kind"]) =>
  PAGE_BUDGET.bar +
  (kind === "description"
    ? PAGE_BUDGET.descriptionPadding
    : kind === "parts"
      ? PAGE_BUDGET.partsHead
      : 0)

// `.so-equipment-list` adds 6pt between rows, not before the first one.
const rowGap = (kind: Atom["kind"]) =>
  kind === "equipment" ? PAGE_BUDGET.equipmentGap : 0

function packPages(atoms: Atom[], capacity: number): PackedPage[] {
  const pages: PackedPage[] = []
  let current: PackedPage = { atoms: [], height: 0 }
  let kinds = new Set<Atom["kind"]>()
  for (const atom of atoms) {
    const cost = () =>
      (kinds.has(atom.kind) ? rowGap(atom.kind) : openingCost(atom.kind)) +
      atom.height
    if (current.atoms.length && current.height + cost() > capacity) {
      pages.push(current)
      current = { atoms: [], height: 0 }
      kinds = new Set()
    }
    current.height += cost()
    kinds.add(atom.kind)
    current.atoms.push(atom)
  }
  if (current.atoms.length) pages.push(current)
  return pages
}

const toPage = ({ atoms, height }: PackedPage): ServiceOrderPage => ({
  description: atoms.flatMap((atom) =>
    atom.kind === "description" ? [atom.line] : []
  ),
  equipment: atoms.flatMap((atom) =>
    atom.kind === "equipment" ? atom.boxes : []
  ),
  parts: atoms.flatMap((atom) => (atom.kind === "parts" ? [atom.line] : [])),
  height,
})

/**
 * Splits an order into explicit letter pages. The first page keeps the fixed
 * single-page design and only its measured capacity; everything else flows to
 * continuation pages in document order, with signatures and totals last.
 */
export function serviceOrderPages(
  data: ServiceOrderData,
  amounts: ReturnType<typeof serviceOrderAmounts> | null,
  showPrices: boolean
): ServiceOrderPage[] {
  const boxes = equipmentBoxes(data)
  const lines = partsLines(data, amounts, showPrices)
  const description = wrapServiceOrderText(
    data.description,
    TEXT_BUDGET.description.charsPerLine
  )

  const equipmentAtoms = Array.from(
    { length: Math.ceil(boxes.length / 2) },
    (_, row) => boxes.slice(row * 2, row * 2 + 2)
  ).slice(FIRST_PAGE_CAPACITY.equipmentRows)

  const atoms: Atom[] = [
    ...description
      .slice(FIRST_PAGE_CAPACITY.descriptionLines)
      .map((line): Atom => ({
        kind: "description",
        line,
        height: PAGE_BUDGET.descriptionLine,
      })),
    ...equipmentAtoms.map((row): Atom => {
      return { kind: "equipment", boxes: row, height: equipmentHeight(row) }
    }),
    ...lines.slice(FIRST_PAGE_CAPACITY.partsRows).map((line): Atom => ({
      kind: "parts",
      line,
      height: partsHeight(line),
    })),
  ]

  const first: ServiceOrderPage = {
    description: description.slice(0, FIRST_PAGE_CAPACITY.descriptionLines),
    equipment: boxes.slice(0, FIRST_PAGE_CAPACITY.equipment),
    parts: lines.slice(0, FIRST_PAGE_CAPACITY.partsRows),
    height: PAGE_BUDGET.height,
  }

  let packed = packPages(atoms, BODY)
  const tail = packed.at(-1)
  if (tail && tail.height + PAGE_BUDGET.signatures > BODY) {
    // The last page must also hold signatures and totals: repack its tail with
    // the reserved block, which only moves rows down, never up.
    packed = [
      ...packed.slice(0, -1),
      ...packPages(tail.atoms, BODY - PAGE_BUDGET.signatures),
    ]
  }

  return [first, ...packed.map(toPage)]
}
