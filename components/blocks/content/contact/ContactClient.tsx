"use client"

import { Box } from "@/components/shared/content/Box"
import {
  ContactPositionLabel,
  ContactPositionType,
} from "@/types/enums/contact-position"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { ContactBlock } from "@/types/blocks/content/contact-block"
import { splitEmail } from "@/lib/formatting/split-email"
import { CopyButton } from "@/components/shared/content/CopyButton"
import Link from "next/link"

interface ContactClientProps {
  data: {
    id: ContactBlock["id"]
    title: ContactBlock["title"]
    excerpt: ContactBlock["excerpt"]
    address: ContactBlock["address"]
    phones: {
      id: number
      phones_id: {
        position: ContactPositionType
        phone: string
      }
    }[]
    emails: {
      id: number
      emails_id: {
        position: ContactPositionType
        email: string
      }
    }[]
  }
}

export function ContactClient({ data }: ContactClientProps) {
  return (
    <Box>
      {/* Phones */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10"></div>
        <span className="text-2xl font-semibold text-muted-foreground">
          Telefonos
        </span>
        <div className="flex-1">
          <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
            {data?.phones.map((phone) => (
              <div key={phone.id} className="flex flex-col gap-1">
                <span className="font-medium text-white/80 lg:text-xl">
                  {
                    ContactPositionLabel[
                      (phone.phones_id.position as ContactPositionType) ?? ""
                    ]
                  }
                </span>
                <Link
                  href={`tel:${phone.phones_id.phone}`}
                  aria-label={`LLamar a ${phone.phones_id.phone}`}
                  title={`LLamar a ${phone.phones_id.phone}`}
                  className="group inline-flex items-center gap-2 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                >
                  <MaterialIcon
                    name="phone"
                    size={18}
                    className="text-white/40 group-hover:text-white"
                  />
                  {phone.phones_id.phone}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Emails */}
      <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
        <span className="text-2xl font-semibold text-muted-foreground">
          Correos
        </span>
        <div className="flex-1">
          <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
            {data?.emails.map((email) => (
              <div key={email.id} className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-white/80 lg:text-xl">
                    {
                      ContactPositionLabel[
                        (email.emails_id.position as ContactPositionType) ?? ""
                      ]
                    }
                  </span>
                  <span
                    aria-label={`Enviar correo a ${email.emails_id.email}`}
                    className="group inline-flex items-center gap-2 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    <MaterialIcon
                      name="mail"
                      size={18}
                      className="text-white/40 group-hover:text-white"
                    />
                    {(() => {
                      const parts = splitEmail(email.emails_id.email)
                      if (!parts) return email.emails_id.email
                      return (
                        <div className="flex items-center gap-0">
                          {parts.localPart}
                          <MaterialIcon
                            name="alternate_email"
                            size={18}
                            className="text-white/60 group-hover:text-white"
                          />
                          {parts.domain}
                        </div>
                      )
                    })()}
                  </span>
                </div>
                <CopyButton content={email.emails_id.email ?? ""} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Box>
  )
}
