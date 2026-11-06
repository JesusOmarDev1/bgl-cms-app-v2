import { Document, Page } from "@formepdf/react"
import { PdfImage } from "@/components/pdf/pdf-image"
import { View } from "@/components/pdf/pdf-primitives"
import { Section } from "@/components/pdf/section"
import { Text } from "@/components/pdf/text"

interface ServiceOrderProps {
  logos: { id: string; src: string }[]
  brandLogo: string
  footerLogo: string
}

const RED = "#d3393b"
const GRAY = "#ebebeb"
const INK = "#333333"
const FIELD = {
  backgroundColor: GRAY,
  borderRadius: 3,
  flexGrow: 1,
  height: 16,
}
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
}: {
  label: string
  fillWidth?: number
  labelWidth?: number
  fieldHeight?: number
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
      />
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
  logos,
  brandLogo,
  footerLogo,
}: ServiceOrderProps) {
  return (
    <Document>
      <Page size={{ width: 600, height: 804 }} margin={0}>
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
            <PdfImage src={brandLogo} width={50} height={50} fit="contain" />
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
            No de Folio. 00000000-0000-4000-8000-000000000000
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
            <View style={{ ...FIELD, height: 14 }} />
            <Text noMargin style={{ color: INK, fontSize: 9 }}>
              de
            </Text>
            <View style={{ ...FIELD, height: 14 }} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, height: 92 }}>
          <Bar>REPORTE DE SERVICIO</Bar>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={{ width: 269 }}>
              <BlankField label="CLIENTE" labelWidth={60} fillWidth={204} />
              <BlankField
                label="DIRECCIÓN"
                labelWidth={60}
                fillWidth={204}
                fieldHeight={36}
              />
            </View>
            <View style={{ width: 269 }}>
              <BlankField label="CONTACTO" labelWidth={60} fillWidth={204} />
              <BlankField label="CIUDAD" labelWidth={60} fillWidth={204} />
              <BlankField label="ESTADO" labelWidth={60} fillWidth={204} />
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
            }}
          />
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
                      }}
                    />
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
                {[0, 1, 2].map((row) => (
                  <View
                    key={row}
                    style={{
                      backgroundColor: GRAY,
                      borderRadius: 3,
                      height: 17,
                    }}
                  />
                ))}
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
            <Text noMargin style={{ color: RED, fontSize: 9, fontWeight: 800 }}>
              REALIZÓ EL TRABAJO
            </Text>
            <BlankField label="NOMBRE" />
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
              />
            </View>
          </View>
          <View style={{ width: 185, gap: 5 }}>
            <Text noMargin style={{ color: RED, fontSize: 9, fontWeight: 800 }}>
              RECIBÍ TRABAJO A SATISFACCIÓN
            </Text>
            <BlankField label="NOMBRE" />
            <BlankField label="DEPARTAMENTO" />
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
              />
            </View>
          </View>
          <View style={{ width: 172 }}>
            {TOTALS.map((label) => (
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
                  }}
                />
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
          {logos.map(({ id, src }) => (
            <View
              key={id}
              style={{
                flexGrow: 1,
              }}
            >
              <PdfImage src={src} width={68} height={20} fit="contain" />
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
          <PdfImage src={footerLogo} width={75} height={63} fit="contain" />
          <Text noMargin style={{ color: "#ffffff", fontSize: 7, width: 180 }}>
            {
              "Servicio de básculas, Venta, Renta, Calibración\nTrazable y Acreditadas ante EMA\nVerificaciones oficiales ante PROFECO\nwww.bglbasculas.com.mx"
            }
          </Text>
          <Text noMargin style={{ color: "#ffffff", fontSize: 7, width: 110 }}>
            {
              "Ofna 33-1810-4839\n33-2876-0122\nCel 33-2506-2280\nventas@bglbasculas.com"
            }
          </Text>
          <Text noMargin style={{ color: "#ffffff", fontSize: 7, width: 163 }}>
            {
              "Federalistas #815 Loc. 23-A\nPlaza Real del Bosque\nCP 45130 Zapopan, Jalisco\nMéxico"
            }
          </Text>
        </View>
      </Page>
    </Document>
  )
}
