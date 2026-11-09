import { Document, Page } from "@formepdf/react"
import { PdfImage } from "@/components/pdf/pdf-image"
import { View } from "@/components/pdf/pdf-primitives"
import { Section } from "@/components/pdf/section"
import { Text } from "@/components/pdf/text"
import { cents, money } from "@/lib/formatting/money"
import { formatDateLong } from "@/lib/formatting/date"

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

export function ServiceOrderAmounts(data: ServiceOrderData) {
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

// Logos
const HEADER_LOGO = new URL("/public/static/logo-dark.png", import.meta.url)
  .href
const FOOTER_LOGO = new URL("/public/static/inverted-logo.png", import.meta.url)
  .href

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
const EQUIPMENT_FIELDS = ["MARCA", "MODELO", "SERIE", "CAPACIDAD"] as const

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
        style={{
          ...(fillWidth
            ? {
                backgroundColor: GRAY,
                borderRadius: 3,
                height: fieldHeight,
                width: fillWidth,
              }
            : FIELD),
          justifyContent: fieldHeight > 16 ? "flex-start" : "center",
          paddingHorizontal: value == null ? 0 : 5,
          paddingTop: fieldHeight > 16 && value != null ? 4 : 0,
        }}
      >
        {value !== undefined && value !== null ? (
          <Text noMargin style={{ color: INK, fontSize: 8 }}>
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

function ServiceOrderHeader({
  data,
  brandLogo = HEADER_LOGO,
}: {
  data?: ServiceOrderData
  brandLogo?: string
}) {
  const date = data
    ? formatDateLong.formatToParts(new Date(data.date_created))
    : null
  const day = date?.find(({ type }) => type === "day")?.value
  const month = date?.find(({ type }) => type === "month")?.value
  const year = date?.find(({ type }) => type === "year")?.value
  return (
    <View style={{ height: 104, paddingHorizontal: 24, paddingTop: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text noMargin style={{ color: RED, fontSize: 24, fontWeight: 900 }}>
          ORDEN DE SERVICIO
        </Text>
        <PdfImage
          src={brandLogo ?? ""}
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
        {`Folio: ${data?.folio ?? "00000000-0000-4000-8000-000000000000"}`}
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
  )
}

function CustomerInformation({
  client,
}: {
  client?: ServiceOrderData["client"]
}) {
  return (
    <View style={{ paddingHorizontal: 24, height: 92 }}>
      <Bar>REPORTE DE SERVICIO</Bar>
      <View style={{ flexDirection: "row", gap: 14 }}>
        <View style={{ width: 269 }}>
          <BlankField
            label="CLIENTE"
            labelWidth={60}
            fillWidth={204}
            value={client?.name}
          />
          <BlankField
            label="DIRECCIÓN"
            labelWidth={60}
            fillWidth={204}
            fieldHeight={36}
            value={client?.address}
          />
        </View>
        <View style={{ width: 269 }}>
          <BlankField
            label="CONTACTO"
            labelWidth={60}
            fillWidth={204}
            value={client?.contact}
          />
          <BlankField
            label="CIUDAD"
            labelWidth={60}
            fillWidth={204}
            value={client?.city}
          />
          <BlankField
            label="ESTADO"
            labelWidth={60}
            fillWidth={204}
            value={client?.state}
          />
        </View>
      </View>
    </View>
  )
}

function ServiceDescription({ description }: { description?: string }) {
  return (
    <View style={{ paddingHorizontal: 24, height: 143 }}>
      <Bar>SERVICIO REALIZADO</Bar>
      <View
        style={{
          backgroundColor: GRAY,
          borderRadius: 3,
          flexGrow: 1,
          marginBottom: 7,
          padding: description === undefined ? 0 : 7,
        }}
      >
        {description !== undefined ? (
          <Text noMargin style={{ color: INK, fontSize: 9 }}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

function ReviewedEquipment({
  scales,
  page,
}: {
  scales?: ServiceOrderData["scales"]
  page: number
}) {
  return (
    <View style={{ paddingHorizontal: 24, height: 114 }}>
      <Bar>EQUIPO REVISADO</Bar>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[0, 1].map((set) => {
          const scale = scales?.[page * 2 + set]?.scales_id
          const values = scale
            ? {
                MARCA: scale.brand.title,
                MODELO: scale.model?.title ?? "",
                SERIE: scale.serial_number ?? "",
                CAPACIDAD: `${scale.capacity} ${scale.units}`,
              }
            : null
          return (
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
                      padding: scales ? 4 : 0,
                    }}
                  >
                    {values ? (
                      <Text noMargin style={{ color: INK, fontSize: 8 }}>
                        {values[label]}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )
        })}
      </View>
    </View>
  )
}

function SpareParts({
  parts,
  lines,
  page,
  showPrices,
}: {
  parts?: ServiceOrderData["parts"]
  lines?: ReturnType<typeof ServiceOrderAmounts>["lines"]
  page: number
  showPrices: boolean
}) {
  return (
    <View style={{ paddingHorizontal: 24, height: 132 }}>
      <Bar>REFACCIONES</Bar>
      <View style={{ flexDirection: "row", gap: 3 }}>
        {PART_FIELDS.map(({ label, width }) => (
          <View key={label} style={{ width, gap: 4 }}>
            <Text noMargin style={{ color: INK, fontSize: 8, fontWeight: 700 }}>
              {label}
            </Text>
            {[0, 1, 2, 3].map((row) => {
              const part = parts?.[page * 4 + row]
              const line = lines?.[page * 4 + row]
              const values: Record<string, string> = {
                CANTIDAD: part ? String(part.quantity) : "",
                DESCRIPCIÓN: part?.inventory_id.title ?? "",
                "PRECIO UNITARIO": showPrices ? money(line?.price ?? null) : "",
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
  )
}

function ServiceSignatures({
  data,
  signatureUrls,
}: {
  data?: ServiceOrderData
  signatureUrls?: { technician: string; client: string }
}) {
  return (
    <View style={{ flexDirection: "row", gap: 10, width: 370 }}>
      <View style={{ width: 175, gap: 5 }}>
        <Text noMargin style={{ color: RED, fontSize: 9, fontWeight: 800 }}>
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
          <Text noMargin style={{ color: INK, fontSize: 8, fontWeight: 700 }}>
            FIRMA
          </Text>
          <View
            style={{
              backgroundColor: GRAY,
              borderRadius: 3,
              flexGrow: 1,
              height: 45,
              padding: data && !signatureUrls?.technician ? 5 : 0,
            }}
          >
            {data && signatureUrls?.technician ? (
              <PdfImage
                src={signatureUrls.technician}
                width={125}
                height={45}
                fit="contain"
                variant="thumbnail"
              />
            ) : data ? (
              <Text noMargin style={{ color: INK, fontSize: 8 }}>
                Firma no disponible
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={{ width: 185, gap: 5 }}>
        <Text noMargin style={{ color: RED, fontSize: 9, fontWeight: 800 }}>
          RECIBÍ EL TRABAJO A SATISFACCIÓN
        </Text>
        <BlankField label="NOMBRE" value={data?.client_name} />
        <BlankField label="DEPARTAMENTO" value={data?.client_department} />
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Text noMargin style={{ color: INK, fontSize: 8, fontWeight: 700 }}>
            FIRMA
          </Text>
          <View
            style={{
              backgroundColor: GRAY,
              borderRadius: 3,
              flexGrow: 1,
              height: 42,
              padding: data && !signatureUrls?.client ? 5 : 0,
            }}
          >
            {data && signatureUrls?.client ? (
              <PdfImage
                src={signatureUrls.client}
                width={135}
                height={42}
                fit="contain"
                variant="thumbnail"
              />
            ) : data ? (
              <Text noMargin style={{ color: INK, fontSize: 8 }}>
                Firma no disponible
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  )
}

function ServiceTotals({
  totals,
  showPrices,
}: {
  totals: (number | null)[]
  showPrices: boolean
}) {
  return (
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
              padding: totals.length > 0 && showPrices ? 2 : 0,
            }}
          >
            {totals.length > 0 && showPrices && totals[index] !== null ? (
              <Text noMargin style={{ color: INK, fontSize: 7 }}>
                {money(totals[index])}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  )
}

function PartnerLogos({ logos }: { logos: { id: string; url: string }[] }) {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        alignItems: "center",
        flexDirection: "row",
        gap: 6,
        height: 30,
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
            height={18}
            fit="contain"
            variant="thumbnail"
          />
        </View>
      ))}
    </View>
  )
}

function ServiceOrderFooter({
  footerLogo = FOOTER_LOGO,
}: {
  footerLogo?: string
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: RED,
        flexDirection: "row",
        gap: 8,
        height: 80,
        paddingHorizontal: 20,
      }}
    >
      <PdfImage
        src={footerLogo ?? ""}
        width={60}
        height={60}
        aspectRatio={1 / 1}
        fit="contain"
        variant="thumbnail"
      />
      <Text noMargin style={{ color: "#ffffff", fontSize: 8, width: 180 }}>
        {
          "Servicio de básculas, Venta, Renta, Calibración\nTrazable y Acreditadas ante EMA\nVerificaciones oficiales ante PROFECO\nwww.bglbasculas.com.mx"
        }
      </Text>
      <Text noMargin style={{ color: "#ffffff", fontSize: 8, width: 110 }}>
        {
          "Oficina 33 1810 4839\nSoporte 33 2506 2280\nVentas 33 4512 2770\nventas@bglbasculas.com"
        }
      </Text>
      <Text noMargin style={{ color: "#ffffff", fontSize: 8, width: 163 }}>
        {
          "Av. Federalistas #815 Loc. 23-A\nPlaza Real del Bosque\nCP 45130 Zapopan, Jalisco México\nfacturacion@bglbasculas.com"
        }
      </Text>
    </View>
  )
}

export function ServiceOrderPreview({
  logos = PARTNER_LOGOS,
  brandLogo = HEADER_LOGO,
  footerLogo = FOOTER_LOGO,
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
  const amounts = data ? ServiceOrderAmounts(data) : null
  const totals = amounts
    ? [amounts.parts, ...amounts.charges, amounts.total]
    : []
  const extraPages = data
    ? Math.max(
        Math.ceil(Math.max(0, data.scales.length - 2) / 2),
        Math.ceil(Math.max(0, data.parts.length - 4) / 4)
      )
    : 0
  return (
    <Document>
      {Array.from({ length: 1 + extraPages }, (_, page) => (
        <Page key={page} size={{ width: 600, height: 804 }} margin={0}>
          <ServiceOrderHeader data={data} brandLogo={brandLogo} />
          <CustomerInformation client={data?.client} />
          <ServiceDescription description={data?.description} />
          <ReviewedEquipment scales={data?.scales} page={page} />
          <SpareParts
            parts={data?.parts}
            lines={amounts?.lines}
            page={page}
            showPrices={showPrices}
          />
          <View
            style={{
              paddingHorizontal: 24,
              flexDirection: "row",
              gap: 10,
              height: 113,
            }}
          >
            <ServiceSignatures
              data={data}
              signatureUrls={props.signatureUrls}
            />
            <ServiceTotals totals={totals} showPrices={showPrices} />
          </View>
          <PartnerLogos logos={logos} />
          <ServiceOrderFooter footerLogo={footerLogo} />
        </Page>
      ))}
    </Document>
  )
}
