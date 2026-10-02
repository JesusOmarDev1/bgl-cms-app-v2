import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { FormView } from "@/components/blocks/content/form/FormView"
import type { FormBlock } from "@/types/blocks/form/form-block"

const formId = "550e8400-e29b-41d4-a716-446655440000"

const audit = {
  date_created: "datetime",
  date_updated: "datetime",
} as const

const fixture = {
  id: formId,
  title: "Contacto",
  sort: 1,
  excerpt: "<p>Cuéntanos qué necesitas.</p>",
  captcha: false,
  status: "published",
  icon: "mail",
  fields: [
    {
      id: 1,
      sort: 1,
      form_block_id: formId,
      collection: "text_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440001",
        identifier: "nombre",
        label: "Nombre",
        required: true,
        width: 50,
        default: "Ana",
        sort: null,
        icon: "person",
        ...audit,
      },
    },
    {
      id: 2,
      sort: 2,
      form_block_id: formId,
      collection: "email_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440002",
        identifier: "correo",
        label: "Correo",
        required: true,
        width: 50,
        default: null,
        sort: null,
        icon: "mail",
        ...audit,
      },
    },
    {
      id: 3,
      sort: 3,
      form_block_id: formId,
      collection: "phone_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440003",
        identifier: "telefono",
        label: "Teléfono",
        required: false,
        width: 50,
        default: null,
        sort: "",
        icon: "call",
        ...audit,
      },
    },
    {
      id: 4,
      sort: 4,
      form_block_id: formId,
      collection: "number_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440004",
        identifier: "cantidad",
        label: "Cantidad",
        required: false,
        width: 50,
        default: 1,
        min: 0,
        max: 100,
        sort: null,
        icon: "pin",
        ...audit,
      },
    },
    {
      id: 5,
      sort: 5,
      form_block_id: formId,
      collection: "date_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440005",
        identifier: "fecha",
        label: "Fecha",
        required: false,
        width: 50,
        default: "2026-10-02",
        hours: false,
        sort: null,
        icon: "calendar_today",
        ...audit,
      },
    },
    {
      id: 6,
      sort: 6,
      form_block_id: formId,
      collection: "date_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440008",
        identifier: "fecha_hora",
        label: "Fecha y hora",
        required: false,
        width: 50,
        default: "2026-10-02T14:30",
        hours: true,
        sort: null,
        icon: "schedule",
        ...audit,
      },
    },
    {
      id: 7,
      sort: 7,
      form_block_id: formId,
      collection: "text_area_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440006",
        identifier: "mensaje",
        label: "Mensaje",
        required: true,
        width: 100,
        default: null,
        sort: null,
        icon: "notes",
        ...audit,
      },
    },
    {
      id: 8,
      sort: 8,
      form_block_id: formId,
      collection: "checkbox_block",
      item: {
        id: "550e8400-e29b-41d4-a716-446655440007",
        identifier: "terminos",
        label: "Acepto los términos",
        required: true,
        width: 100,
        default: "true",
        sort: null,
        ...audit,
      },
    },
  ],
  ...audit,
} satisfies FormBlock

const meta = {
  title: "Blocks/Content/Form/FormClient",
  component: FormView,
  parameters: {
    layout: "padded",
    nextjs: { appDirectory: true },
  },
  args: {
    data: fixture,
    onSubmit: () => {},
  },
} satisfies Meta<typeof FormView>

export default meta
type Story = StoryObj<typeof meta>

export const AllFields: Story = {}
