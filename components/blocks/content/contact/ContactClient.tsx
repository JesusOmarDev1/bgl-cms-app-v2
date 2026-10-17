"use client"

import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { CopyButton } from "@/components/shared/content/CopyButton"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { splitEmail } from "@/lib/formatting/split-email"
import type { ContactBlockQuery } from "@/services/domain/db/queries/blocks/contact-block/contact-block.fields"
import { ContactPositionLabel } from "@/types/enums/contact-position"

export function ContactClient({ data }: { data: ContactBlockQuery }) {
  const phones: { id: number; phone: string; label: string | null }[] = []
  for (const row of data.phones ?? []) {
    if (!row.phones_id?.phone) continue
    phones.push({
      id: row.id,
      phone: row.phones_id.phone,
      label: ContactPositionLabel[row.phones_id.position] ?? null,
    })
  }

  const emails: { id: number; email: string; label: string | null }[] = []
  for (const row of data.emails ?? []) {
    if (!row.emails_id?.email) continue
    emails.push({
      id: row.id,
      email: row.emails_id.email,
      label: ContactPositionLabel[row.emails_id.position] ?? null,
    })
  }

  if (
    !data.title &&
    !data.excerpt &&
    !data.address &&
    phones.length === 0 &&
    emails.length === 0
  ) {
    return null
  }

  return (
    <Box
      data-directus={setAttr({
        collection: "contact_block",
        item: data.id,
        fields: "title,excerpt,address,phones,emails",
        mode: "popover",
      })}
      display="flex"
      gap={2}
      orientation="vertical"
      paddingBottom={3}
      paddingTop={3}
    >
      <BlockHeading excerpt={data.excerpt} title={data.title} />
      {data.address ? (
        <SafeHtml content={data.address} preset="compact" />
      ) : null}
      {phones.length > 0 ? (
        <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
          <span className="text-2xl font-semibold text-muted-foreground">
            Telefonos
          </span>
          <div className="flex-1">
            <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
              {phones.map((phone) => (
                <div key={phone.id} className="flex flex-col gap-1">
                  {phone.label ? (
                    <span className="font-medium text-white/80 lg:text-xl">
                      {phone.label}
                    </span>
                  ) : null}
                  <Link
                    href={`tel:${phone.phone}`}
                    aria-label={`LLamar a ${phone.phone}`}
                    title={`LLamar a ${phone.phone}`}
                    className="group inline-flex items-center gap-2 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    <MaterialIcon
                      name="phone"
                      size={18}
                      className="text-white/40 group-hover:text-white"
                    />
                    {phone.phone}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {emails.length > 0 ? (
        <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
          <span className="text-2xl font-semibold text-muted-foreground">
            Correos
          </span>
          <div className="flex-1">
            <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
              {emails.map((email) => {
                const parts = splitEmail(email.email)
                return (
                  <div key={email.id} className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      {email.label ? (
                        <span className="font-medium text-white/80 lg:text-xl">
                          {email.label}
                        </span>
                      ) : null}
                      <span
                        aria-label={`Enviar correo a ${email.email}`}
                        className="group inline-flex items-center gap-2 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                      >
                        <MaterialIcon
                          name="mail"
                          size={18}
                          className="text-white/40 group-hover:text-white"
                        />
                        {parts ? (
                          <span className="flex items-center gap-0">
                            {parts.localPart}
                            <MaterialIcon
                              name="alternate_email"
                              size={18}
                              className="text-white/60 group-hover:text-white"
                            />
                            {parts.domain}
                          </span>
                        ) : (
                          email.email
                        )}
                      </span>
                    </div>
                    <CopyButton content={email.email} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </Box>
  )
}
