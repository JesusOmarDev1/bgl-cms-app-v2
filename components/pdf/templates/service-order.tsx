import { Document, Page } from "@formepdf/react"
import { PdfImage } from "@/components/pdf/pdf-image"
import { View } from "@/components/pdf/pdf-primitives"
import { Section } from "@/components/pdf/section"
import { Text } from "@/components/pdf/text"

// Relations must be expanded before passing an order to the PDF; IDs alone cannot fill it.
export interface ServiceOrderData {
  folio: string
  date_created: string
  client: {
    id: string
    name: string
    address?: string | null
    contact?: string | null
    city?: string | null
    state?: string | null
  }
  description: string
  technician_name: { first_name: string; last_name: string }
  client_name: string
  client_department: string | null
  technician_signature: { id: string }
  client_signature: { id: string }
  status: "draft" | "paid" | "cancelled"
  scales: {
    scales_id: {
      id: string
      client: { id: string }
      brand: { title: string }
      model: { title: string } | null
      serial_number: string | null
      capacity: number
      units: string
    }
  }[]
  parts: {
    quantity: number
    inventory_id: { title: string; price: string | number | null }
  }[]
  labor_cost: string | number | null
  overtime_cost: string | number | null
  travel_cost: string | number | null
  other_cost: string | number | null
  apply_vat: boolean
}

type ServiceOrderProps = {
  logos?: { id: string; url: string }[]
  brandLogo?: string
  footerLogo?: string
  showPrices?: boolean
} & (
  | { variant?: "blank"; data?: never; signatureUrls?: never }
  | {
      variant: "filled"
      data: ServiceOrderData
      // Authorized, absolute PNG URLs are supplied outside the template.
      signatureUrls?: { technician: string; client: string }
    }
)

function cents(value: string | number | null): number | null {
  if (value === null) return null
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value))
  if (!match) throw new Error("Invalid service order amount")
  const result =
    Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"))
  if (!Number.isSafeInteger(result))
    throw new Error("Service order amount exceeds safe range")
  return result
}

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function money(value: number | null): string {
  return value === null ? "" : currency.format(value / 100)
}

export function serviceOrderAmounts(data: ServiceOrderData) {
  const lines = data.parts.map(({ quantity, inventory_id }) => {
    if (!Number.isSafeInteger(quantity) || quantity <= 0)
      throw new Error("Invalid service order quantity")
    const price = cents(inventory_id.price)
    return { price, amount: price === null ? null : price * quantity }
  })
  const parts = lines.some((line) => line.amount === null)
    ? null
    : lines.reduce((sum, line) => sum + (line.amount ?? 0), 0)
  const charges = [
    data.labor_cost,
    data.overtime_cost,
    data.travel_cost,
    data.other_cost,
  ].map(cents)
  const hasAmount =
    data.parts.length > 0 || charges.some((charge) => charge !== null)
  const subtotal =
    parts === null || !hasAmount
      ? null
      : parts + charges.reduce<number>((sum, charge) => sum + (charge ?? 0), 0)
  const vat =
    subtotal !== null && data.apply_vat ? Math.round(subtotal * 0.16) : null
  return {
    lines,
    parts: data.parts.length ? parts : null,
    charges,
    subtotal,
    vat,
    total: subtotal === null ? null : subtotal + (vat ?? 0),
  }
}

// Partner Logos
const PARTNER_LOGOS = [
  {
    id: "rice-lake",
    url: new URL("../../../assets/logos/pdf/rice_lake.png", import.meta.url)
      .href,
  },
  {
    id: "revuelta",
    url: new URL(
      "../../../assets/logos/pdf/basculas_revuelta.png",
      import.meta.url
    ).href,
  },
  {
    id: "torrey",
    url: new URL("../../../assets/logos/pdf/torrey.png", import.meta.url).href,
  },
  {
    id: "anyload",
    url: new URL("../../../assets/logos/pdf/anyload.png", import.meta.url).href,
  },
  {
    id: "gse",
    url: new URL("../../../assets/logos/pdf/gse.png", import.meta.url).href,
  },
  {
    id: "kretz",
    url: new URL("../../../assets/logos/pdf/kretz.png", import.meta.url).href,
  },
  {
    id: "epson",
    url: new URL("../../../assets/logos/pdf/epson.png", import.meta.url).href,
  },
]

function staticLogo(path: string): string {
  if (typeof window === "undefined")
    throw new Error("Service order PDF requires browser-generated image URLs")
  return new URL(path, window.location.href).href
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Mexico_City",
})

// Colors
const RED = "#d3393b"
const GRAY = "#ebebeb"
const INK = "#333333"

// Gray Field
const FIELD = {
  backgroundColor: GRAY,
  borderRadius: 3,
  flexGrow: 1,
  height: 16,
}

// Field Labels
const EQUIPMENT_FIELDS = ["MARCA", "MODELO", "SERIE", "CAPACIDAD"]

const PART_FIELDS = [
  { label: "CANTIDAD", width: 70 },
  { label: "DESCRIPCIÓN", width: 266 },
  { label: "PRECIO UNITARIO", width: 103 },
  { label: "TOTAL", width: 104 },
]

const TOTALS = [
  "TOTAL DE PARTES",
  "MANO DE OBRA",
  "TIEMPO EXTRA",
  "GASTOS DE VIAJE",
  "OTROS GASTOS",
  "TOTAL",
]

function BlankField({
  label,
  fillWidth,
  labelWidth,
  fieldHeight = 16,
  value,
}: {
  label: string
  fillWidth?: number
  labelWidth?: number
  fieldHeight?: number
  value?: string | number | null
}) {
  return (
    <View
      style={{
        alignItems: fieldHeight > 16 ? "flex-start" : "center",
        flexDirection: "row",
        gap: 5,
        height: fieldHeight + 5,
      }}
    >
      <Text
        noMargin
        style={{ color: INK, fontSize: 8, fontWeight: 700, width: labelWidth }}
      >
        {label}
      </Text>
      <View
        style={
          fillWidth
            ? {
                backgroundColor: GRAY,
                borderRadius: 3,
                height: fieldHeight,
                width: fillWidth,
              }
            : FIELD
        }
      >
        {value !== undefined && value !== null ? (
          <Text noMargin style={{ color: INK, fontSize: 8, padding: 3 }}>
            {String(value)}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

function Bar({ children }: { children: string }) {
  return (
    <Section
      spacing="none"
      background={RED}
      style={{
        alignItems: "center",
        height: 18,
        justifyContent: "center",
        marginBottom: 7,
        marginLeft: -24,
        width: 600,
      }}
    >
      <Text
        noMargin
        style={{ color: "#ffffff", fontSize: 11, fontWeight: 800 }}
      >
        {children}
      </Text>
    </Section>
  )
}

export function ServiceOrderPreview({
  logos = PARTNER_LOGOS,
  brandLogo,
  footerLogo,
  showPrices = false,
  ...props
}: ServiceOrderProps) {
  const data = props.variant === "filled" ? props.data : undefined
  if (
    data &&
    (!data.scales.length ||
      data.scales.some(
        ({ scales_id }) => scales_id.client.id !== data.client.id
      ))
  )
    throw new Error("Service order scales must belong to the selected client")
  const amounts = data ? serviceOrderAmounts(data) : null
  const date = data
    ? dateFormatter.formatToParts(new Date(data.date_created))
    : null
  const day = date?.find(({ type }) => type === "day")?.value
  const month = date?.find(({ type }) => type === "month")?.value
  const year = date?.find(({ type }) => type === "year")?.value
  const totals = amounts
    ? [amounts.parts, ...amounts.charges, amounts.total]
    : []
  const extraPages = data
    ? Math.max(
        Math.ceil(Math.max(0, data.scales.length - 2) / 2),
        Math.ceil(Math.max(0, data.parts.length - 3) / 3)
      )
    : 0
  return (
    <Document>
      {Array.from({ length: 1 + extraPages }, (_, page) => (
        <Page key={page} size={{ width: 600, height: 804 }} margin={0}>
          <View style={{ height: 104, paddingHorizontal: 24, paddingTop: 16 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                noMargin
                style={{ color: RED, fontSize: 24, fontWeight: 900 }}
              >
                ORDEN DE SERVICIO
              </Text>
              <PdfImage
                src={brandLogo ?? staticLogo("/static/logo-dark.png")}
                width={60}
                height={60}
                aspectRatio={1 / 1}
                fit="contain"
                variant="thumbnail"
              />
            </View>
            <Text
              noMargin
              style={{
                color: INK,
                fontWeight: 700,
                fontSize: 10,
                left: 24,
                position: "absolute",
                textAlign: "left",
                top: 53,
                width: 552,
              }}
            >
              {`No de Folio. ${data?.folio ?? "00000000-0000-4000-8000-000000000000"}`}
            </Text>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 7,
                left: 148,
                position: "absolute",
                top: 81,
                width: 428,
              }}
            >
              <Text noMargin style={{ color: INK, fontSize: 9 }}>
                Zapopan, Jalisco a
              </Text>
              <View
                style={{
                  ...FIELD,
                  height: 14,
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                {day ? (
                  <Text noMargin style={{ color: INK, fontSize: 9 }}>
                    {day}
                  </Text>
                ) : null}
              </View>
              <Text noMargin style={{ color: INK, fontSize: 9 }}>
                de
              </Text>
              <View
                style={{
                  ...FIELD,
                  height: 14,
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                {month && year ? (
                  <Text noMargin style={{ color: INK, fontSize: 9 }}>
                    {`${month} de ${year}`}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, height: 92 }}>
            <Bar>REPORTE DE SERVICIO</Bar>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <View style={{ width: 269 }}>
                <BlankField
                  label="CLIENTE"
                  labelWidth={60}
                  fillWidth={204}
                  value={data?.client.name}
                />
                <BlankField
                  label="DIRECCIÓN"
                  labelWidth={60}
                  fillWidth={204}
                  fieldHeight={36}
                  value={data?.client.address}
                />
              </View>
              <View style={{ width: 269 }}>
                <BlankField
                  label="CONTACTO"
                  labelWidth={60}
                  fillWidth={204}
                  value={data?.client.contact}
                />
                <BlankField
                  label="CIUDAD"
                  labelWidth={60}
                  fillWidth={204}
                  value={data?.client.city}
                />
                <BlankField
                  label="ESTADO"
                  labelWidth={60}
                  fillWidth={204}
                  value={data?.client.state}
                />
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, height: 143 }}>
            <Bar>SERVICIO REALIZADO</Bar>
            <View
              style={{
                backgroundColor: GRAY,
                borderRadius: 3,
                flexGrow: 1,
                marginBottom: 7,
                padding: data ? 7 : 0,
              }}
            >
              {data ? (
                <Text noMargin style={{ color: INK, fontSize: 9 }}>
                  {data.description}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, height: 114 }}>
            <Bar>EQUIPO REVISADO</Bar>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[0, 1].map((set) => (
                <View
                  key={set}
                  style={{ flexDirection: "row", flexGrow: 1, gap: 3 }}
                >
                  {EQUIPMENT_FIELDS.map((label) => (
                    <View key={label} style={{ flexGrow: 1, gap: 5 }}>
                      <Text
                        noMargin
                        style={{ color: INK, fontSize: 8, fontWeight: 700 }}
                      >
                        {label}
                      </Text>
                      <View
                        style={{
                          backgroundColor: GRAY,
                          borderRadius: 3,
                          height: 51,
                          padding: data ? 4 : 0,
                        }}
                      >
                        {data?.scales[page * 2 + set] ? (
                          <Text noMargin style={{ color: INK, fontSize: 8 }}>
                            {String(
                              (
                                {
                                  MARCA:
                                    data.scales[page * 2 + set].scales_id.brand
                                      .title,
                                  MODELO:
                                    data.scales[page * 2 + set].scales_id.model
                                      ?.title ?? "",
                                  SERIE:
                                    data.scales[page * 2 + set].scales_id
                                      .serial_number ?? "",
                                  CAPACIDAD: `${data.scales[page * 2 + set].scales_id.capacity} ${data.scales[page * 2 + set].scales_id.units}`,
                                } as Record<string, string>
                              )[label]
                            )}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, height: 114 }}>
            <Bar>REFACCIONES</Bar>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {PART_FIELDS.map(({ label, width }) => (
                <View key={label} style={{ width, gap: 4 }}>
                  <Text
                    noMargin
                    style={{ color: INK, fontSize: 8, fontWeight: 700 }}
                  >
                    {label}
                  </Text>
                  {[0, 1, 2].map((row) => {
                    const part = data?.parts[page * 3 + row]
                    const line = amounts?.lines[page * 3 + row]
                    const values: Record<string, string> = {
                      CANTIDAD: part ? String(part.quantity) : "",
                      DESCRIPCIÓN: part?.inventory_id.title ?? "",
                      "PRECIO UNITARIO": showPrices
                        ? money(line?.price ?? null)
                        : "",
                      TOTAL: showPrices ? money(line?.amount ?? null) : "",
                    }
                    return (
                      <View
                        key={row}
                        style={{
                          backgroundColor: GRAY,
                          borderRadius: 3,
                          height: 17,
                          padding: part ? 3 : 0,
                        }}
                      >
                        {part ? (
                          <Text noMargin style={{ color: INK, fontSize: 8 }}>
                            {values[label]}
                          </Text>
                        ) : null}
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 24,
              flexDirection: "row",
              gap: 10,
              height: 131,
            }}
          >
            <View style={{ width: 175, gap: 5 }}>
              <Text
                noMargin
                style={{ color: RED, fontSize: 9, fontWeight: 800 }}
              >
                REALIZÓ EL TRABAJO
              </Text>
              <BlankField
                label="NOMBRE"
                value={
                  data
                    ? `${data.technician_name.first_name} ${data.technician_name.last_name}`
                    : undefined
                }
              />
              <View style={{ flexDirection: "row", gap: 5 }}>
                <Text
                  noMargin
                  style={{ color: INK, fontSize: 8, fontWeight: 700 }}
                >
                  FIRMA
                </Text>
                <View
                  style={{
                    backgroundColor: GRAY,
                    borderRadius: 3,
                    flexGrow: 1,
                    height: 45,
                  }}
                >
                  {props.variant === "filled" &&
                  props.signatureUrls?.technician ? (
                    <PdfImage
                      src={props.signatureUrls.technician}
                      width={125}
                      height={45}
                      fit="contain"
                      variant="thumbnail"
                    />
                  ) : data ? (
                    <Text noMargin style={{ color: INK, fontSize: 7 }}>
                      Firma no disponible
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
            <View style={{ width: 185, gap: 5 }}>
              <Text
                noMargin
                style={{ color: RED, fontSize: 9, fontWeight: 800 }}
              >
                RECIBÍ TRABAJO A SATISFACCIÓN
              </Text>
              <BlankField label="NOMBRE" value={data?.client_name} />
              <BlankField
                label="DEPARTAMENTO"
                value={data?.client_department}
              />
              <View style={{ flexDirection: "row", gap: 5 }}>
                <Text
                  noMargin
                  style={{ color: INK, fontSize: 8, fontWeight: 700 }}
                >
                  FIRMA
                </Text>
                <View
                  style={{
                    backgroundColor: GRAY,
                    borderRadius: 3,
                    flexGrow: 1,
                    height: 42,
                  }}
                >
                  {props.variant === "filled" && props.signatureUrls?.client ? (
                    <PdfImage
                      src={props.signatureUrls.client}
                      width={135}
                      height={42}
                      fit="contain"
                      variant="thumbnail"
                    />
                  ) : data ? (
                    <Text noMargin style={{ color: INK, fontSize: 7 }}>
                      Firma no disponible
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
            <View style={{ width: 172 }}>
              {TOTALS.map((label, index) => (
                <View
                  key={label}
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 4,
                    height: 19,
                  }}
                >
                  <View style={{ width: 95 }}>
                    <Text
                      noMargin
                      style={{
                        color: label === "TOTAL" ? RED : INK,
                        fontSize: 8,
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: GRAY,
                      borderRadius: 3,
                      width: 73,
                      height: 16,
                      padding: data && showPrices ? 2 : 0,
                    }}
                  >
                    {data && showPrices && totals[index] !== null ? (
                      <Text noMargin style={{ color: INK, fontSize: 7 }}>
                        {money(totals[index])}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 24,
              alignItems: "center",
              flexDirection: "row",
              gap: 6,
              height: 36,
            }}
          >
            {logos.map(({ id, url }) => (
              <View
                key={id}
                style={{
                  flexGrow: 1,
                }}
              >
                <PdfImage
                  src={url}
                  width={68}
                  height={20}
                  fit="contain"
                  variant="thumbnail"
                />
              </View>
            ))}
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: RED,
              flexDirection: "row",
              gap: 8,
              height: 70,
              paddingHorizontal: 24,
            }}
          >
            <PdfImage
              src={footerLogo ?? staticLogo("/static/inverted-logo.png")}
              width={65}
              height={65}
              aspectRatio={1 / 1}
              fit="contain"
              variant="thumbnail"
            />
            <Text
              noMargin
              style={{ color: "#ffffff", fontSize: 8, width: 180 }}
            >
              {
                "Servicio de básculas, Venta, Renta, Calibración\nTrazable y Acreditadas ante EMA\nVerificaciones oficiales ante PROFECO\nwww.bglbasculas.com.mx"
              }
            </Text>
            <Text
              noMargin
              style={{ color: "#ffffff", fontSize: 8, width: 110 }}
            >
              {
                "Oficina 33 1810 4839\nSoporte 33 2506 2280\nVentas 33 4512 2770\nventas@bglbasculas.com"
              }
            </Text>
            <Text
              noMargin
              style={{ color: "#ffffff", fontSize: 8, width: 163 }}
            >
              {
                "Av. Federalistas #815 Loc. 23-A\nPlaza Real del Bosque\nCP 45130 Zapopan, Jalisco México\nfacturacion@bglbasculas.com"
              }
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  )
}
