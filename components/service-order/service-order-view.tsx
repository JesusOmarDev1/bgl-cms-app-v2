import Image from "next/image"

import "@/app/print.css"
import "./service-order.css"

import { formatDateLong } from "@/lib/formatting/date"
import { money } from "@/lib/formatting/money"

import {
  assertScalesBelongToClient,
  serviceOrderAmounts,
  type ServiceOrderData,
} from "./service-order-helpers"
import {
  EMPTY_EQUIPMENT_BOX,
  EMPTY_PARTS_LINE,
  equipmentBoxes,
  partsLines,
  serviceOrderPages,
  type ServiceOrderEquipmentBox,
  type ServiceOrderPartsLine,
} from "./service-order-pages"

type ServiceOrderProps = {
  logos?: { id: string; name: string; url: string }[]
  brandLogo?: string
  footerLogo?: string
  showPrices?: boolean
} & (
  | { variant?: "blank"; data?: never; signatureUrls?: never }
  | {
      // `multipage` stacks explicit letter pages; it needs the same payload.
      variant: "filled" | "multipage"
      data: ServiceOrderData
      // Authorized, absolute PNG URLs are supplied outside the view.
      signatureUrls?: { technician: string; client: string }
    }
)

// The printed form always shows these slots; real entries come first.
const padded = <T,>(items: T[], blank: T, minimum: number): T[] =>
  items.length >= minimum
    ? items
    : [...items, ...Array.from({ length: minimum - items.length }, () => blank)]

// Public assets resolve from the site root in Next and from `staticDirs` in Storybook.
const HEADER_LOGO = "/static/logo-dark.png"
const FOOTER_LOGO = "/static/inverted-logo.png"

// Bundler assets: Vite serves them straight from `assets/`, no PDF context needed.
const PARTNER_LOGOS = [
  {
    id: "rice-lake",
    name: "Rice Lake",
    url: new URL(
      "../../assets/logos/service-order/rice_lake.png",
      import.meta.url
    ).href,
  },
  {
    id: "revuelta",
    name: "Básculas Revuelta",
    url: new URL(
      "../../assets/logos/service-order/basculas_revuelta.png",
      import.meta.url
    ).href,
  },
  {
    id: "torrey",
    name: "Torrey",
    url: new URL("../../assets/logos/service-order/torrey.png", import.meta.url)
      .href,
  },
  {
    id: "anyload",
    name: "Anyload",
    url: new URL(
      "../../assets/logos/service-order/anyload.png",
      import.meta.url
    ).href,
  },
  {
    id: "gse",
    name: "GSE",
    url: new URL("../../assets/logos/service-order/gse.png", import.meta.url)
      .href,
  },
  {
    id: "kretz",
    name: "Kretz",
    url: new URL("../../assets/logos/service-order/kretz.png", import.meta.url)
      .href,
  },
  {
    id: "epson",
    name: "Epson",
    url: new URL("../../assets/logos/service-order/epson.png", import.meta.url)
      .href,
  },
]

const TOTALS = [
  "TOTAL DE PARTES",
  "MANO DE OBRA",
  "TIEMPO EXTRA",
  "GASTOS DE VIAJE",
  "OTROS GASTOS",
  "TOTAL",
] as const

const EMPTY_FOLIO = "00000000-0000-4000-8000-000000000000"

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="so-field-row">
      <dt>{label}</dt>
      <dd>{value ?? null}</dd>
    </div>
  )
}

function Signature({
  title,
  name,
  department,
  url,
  missingText,
}: {
  title: string
  name?: string
  department?: string | null
  url?: string
  missingText?: string
}) {
  return (
    <section className="so-signature-block">
      <h2 className="so-signature-title">{title}</h2>
      <dl>
        <Field label="NOMBRE" value={name} />
        {department !== undefined ? (
          <Field label="DEPARTAMENTO" value={department} />
        ) : null}
      </dl>
      <div className="so-signature-mark">
        <p className="so-signature-label">FIRMA</p>
        <div className="so-signature-box">
          {url ? (
            <Image
              alt={`Firma de ${title.toLowerCase()}`}
              height={42}
              loading="eager"
              src={url}
              unoptimized
              width={160}
            />
          ) : (
            missingText
          )}
        </div>
      </div>
    </section>
  )
}

function ServiceOrderHeader({
  data,
  brandLogo,
}: {
  data?: ServiceOrderData
  brandLogo: string
}) {
  const date = data
    ? formatDateLong.formatToParts(new Date(data.date_created))
    : []
  const datePart = (type: Intl.DateTimeFormatPartTypes) =>
    date.find((part) => part.type === type)?.value

  return (
    <header className="so-header-block">
      <div className="so-header-top-row">
        <h1 className="so-document-title">ORDEN DE SERVICIO</h1>
        <Image
          className="so-header-brand-logo"
          alt="BGL Básculas"
          height={60}
          loading="eager"
          src={brandLogo}
          unoptimized
          width={60}
        />
      </div>
      <p className="so-header-folio">{`Folio: ${data?.folio ?? EMPTY_FOLIO}`}</p>
      <p className="so-header-date-row">
        Zapopan, Jalisco a
        <span className="so-header-date-value">{datePart("day") ?? null}</span>
        de
        <span className="so-header-date-value">
          {datePart("month") && datePart("year")
            ? `${datePart("month")} de ${datePart("year")}`
            : null}
        </span>
      </p>
    </header>
  )
}

function ServiceOrderClient({ data }: { data?: ServiceOrderData }) {
  return (
    <section className="so-sheet-section">
      <h2 className="so-section-bar">REPORTE DE SERVICIO</h2>
      <dl className="so-fields-grid">
        <Field label="CLIENTE" value={data?.client.name} />
        <Field label="CONTACTO" value={data?.client.contact} />
        <Field label="DIRECCIÓN" value={data?.client.address} />
        <Field label="CIUDAD" value={data?.client.city} />
        <Field label="ESTADO" value={data?.client.state} />
      </dl>
    </section>
  )
}

function ServiceOrderDescription({ text }: { text?: string | null }) {
  return (
    <section className="so-sheet-section">
      <h2 className="so-section-bar">SERVICIO REALIZADO</h2>
      <p className="so-description-block">{text ?? null}</p>
    </section>
  )
}

function ServiceOrderEquipment({
  boxes,
}: {
  boxes: ServiceOrderEquipmentBox[]
}) {
  return (
    <section className="so-sheet-section">
      <h2 className="so-section-bar">EQUIPO REVISADO</h2>
      <ul className="so-equipment-list">
        {boxes.map((scale, index) => (
          <li className="so-equipment-item-box" key={index}>
            <dl>
              <div>
                <dt>MARCA</dt>
                <dd>{scale.brand}</dd>
              </div>
              <div>
                <dt>MODELO</dt>
                <dd>{scale.model}</dd>
              </div>
              <div>
                <dt>SERIE</dt>
                <dd>{scale.serial}</dd>
              </div>
              <div>
                <dt>CAPACIDAD</dt>
                <dd>{scale.capacity}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ServiceOrderParts({ rows }: { rows: ServiceOrderPartsLine[] }) {
  return (
    <section className="so-sheet-section">
      <h2 className="so-section-bar">REFACCIONES</h2>
      <table className="so-parts-table">
        <caption className="so-visually-hidden">
          Refacciones del servicio
        </caption>
        <colgroup>
          <col style={{ width: "70pt" }} />
          <col style={{ width: "266pt" }} />
          <col style={{ width: "103pt" }} />
          <col style={{ width: "104pt" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">CANTIDAD</th>
            <th scope="col">DESCRIPCIÓN</th>
            <th scope="col" className="so-amount-cell">
              PRECIO UNITARIO
            </th>
            <th scope="col" className="so-amount-cell">
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.quantity}</td>
              <td>{row.description}</td>
              <td className="so-amount-cell">{row.unitPrice}</td>
              <td className="so-amount-cell">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function ServiceOrderSignaturesAndTotals({
  data,
  amounts,
  signatureUrls,
  showPrices,
}: {
  data?: ServiceOrderData
  amounts: ReturnType<typeof serviceOrderAmounts> | null
  signatureUrls?: { technician: string; client: string }
  showPrices: boolean
}) {
  const totals = amounts
    ? [amounts.parts, ...amounts.charges, amounts.total]
    : []

  return (
    <div className="so-signatures-totals-row">
      <div className="so-signature-group">
        <Signature
          title="REALIZÓ EL TRABAJO"
          name={
            data
              ? `${data.technician_name.first_name} ${data.technician_name.last_name}`
              : undefined
          }
          url={signatureUrls?.technician}
          missingText={data ? "Firma no disponible" : undefined}
        />
        <Signature
          title="RECIBÍ EL TRABAJO A SATISFACCIÓN"
          name={data?.client_name}
          department={data?.client_department ?? null}
          url={signatureUrls?.client}
          missingText={data ? "Firma no disponible" : undefined}
        />
      </div>
      <dl className="so-totals-list" aria-label="Totales; el total incluye IVA">
        {TOTALS.map((label, index) => (
          <div
            className={
              label === "TOTAL"
                ? "so-total-row so-total-row-strong"
                : "so-total-row"
            }
            key={label}
          >
            <dt>{label}</dt>
            <dd>{showPrices ? money(totals[index] ?? null) : null}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function PartnerLogos({
  logos,
}: {
  logos: { id: string; name: string; url: string }[]
}) {
  return (
    <div className="so-partner-logos">
      {logos.map((logo) => (
        <Image
          key={logo.id}
          alt={logo.name}
          height={32}
          loading="eager"
          src={logo.url}
          unoptimized
          width={72}
        />
      ))}
    </div>
  )
}

function ServiceOrderFooter({ footerLogo }: { footerLogo: string }) {
  return (
    <footer className="so-footer-block">
      <Image
        className="so-footer-brand"
        alt="BGL Básculas"
        height={60}
        loading="eager"
        src={footerLogo}
        unoptimized
        width={60}
      />
      <p>
        {
          "Servicio de básculas, Venta, Renta, Calibración\nTrazable y Acreditadas ante EMA\nVerificaciones oficiales ante PROFECO\nwww.bglbasculas.com.mx"
        }
      </p>
      <p>
        {
          "Oficina 33 1810 4839\nSoporte 33 2506 2280\nVentas 33 4512 2770\nventas@bglbasculas.com"
        }
      </p>
      <p>
        {
          "Av. Federalistas #815 Loc. 23-A\nPlaza Real del Bosque\nCP 45130 Zapopan, Jalisco México\nfacturacion@bglbasculas.com"
        }
      </p>
    </footer>
  )
}

export function ServiceOrderView({
  logos = PARTNER_LOGOS,
  brandLogo = HEADER_LOGO,
  footerLogo = FOOTER_LOGO,
  showPrices = false,
  ...props
}: ServiceOrderProps) {
  const data =
    props.variant === "filled" || props.variant === "multipage"
      ? props.data
      : undefined
  const signatureUrls =
    props.variant === "filled" || props.variant === "multipage"
      ? props.signatureUrls
      : undefined
  if (data) assertScalesBelongToClient(data)
  const amounts = data ? serviceOrderAmounts(data) : null
  const boxes = padded(data ? equipmentBoxes(data) : [], EMPTY_EQUIPMENT_BOX, 2)
  const rows = padded(
    data ? partsLines(data, amounts, showPrices) : [],
    EMPTY_PARTS_LINE,
    4
  )

  if (props.variant === "multipage") {
    const pages = serviceOrderPages(props.data, amounts, showPrices)
    return (
      <div className="so-sheet-canvas so-multipage-stack">
        {pages.map((page, index) => (
          <article
            aria-label={
              index === 0
                ? "Orden de servicio"
                : `Orden de servicio, página ${index + 1}`
            }
            className="so-page-sheet so-page-sheet-filled"
            key={index}
          >
            <ServiceOrderHeader data={data} brandLogo={brandLogo} />
            {index === 0 ? <ServiceOrderClient data={data} /> : null}
            {page.description.length ? (
              <ServiceOrderDescription text={page.description.join("\n")} />
            ) : null}
            {page.equipment.length ? (
              <ServiceOrderEquipment
                boxes={
                  index === 0
                    ? padded(page.equipment, EMPTY_EQUIPMENT_BOX, 2)
                    : page.equipment
                }
              />
            ) : null}
            {page.parts.length ? (
              <ServiceOrderParts
                rows={
                  index === 0
                    ? padded(page.parts, EMPTY_PARTS_LINE, 4)
                    : page.parts
                }
              />
            ) : null}
            {index === pages.length - 1 ? (
              <ServiceOrderSignaturesAndTotals
                data={data}
                amounts={amounts}
                signatureUrls={signatureUrls}
                showPrices={showPrices}
              />
            ) : null}
            <PartnerLogos logos={logos} />
            <ServiceOrderFooter footerLogo={footerLogo} />
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="so-sheet-canvas">
      <article
        className={
          data ? "so-page-sheet so-page-sheet-filled" : "so-page-sheet"
        }
        aria-label="Orden de servicio"
      >
        <ServiceOrderHeader data={data} brandLogo={brandLogo} />
        <ServiceOrderClient data={data} />
        <ServiceOrderDescription text={data?.description ?? null} />
        <ServiceOrderEquipment boxes={boxes} />
        <ServiceOrderParts rows={rows} />
        <ServiceOrderSignaturesAndTotals
          data={data}
          amounts={amounts}
          signatureUrls={signatureUrls}
          showPrices={showPrices}
        />
        <PartnerLogos logos={logos} />
        <ServiceOrderFooter footerLogo={footerLogo} />
      </article>
    </div>
  )
}
