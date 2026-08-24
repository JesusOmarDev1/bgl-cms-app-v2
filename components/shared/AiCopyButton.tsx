import * as React from "react"
import { Check, ChevronDown, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ChatGPTIcon } from "@/assets/logos/ai/chatgpt"
import { PerplexityAIIcon } from "@/assets/logos/ai/perplexity"
import { GoogleAIIcon } from "@/assets/logos/ai/googleai"
import { GrokIcon } from "@/assets/logos/ai/grok"
import { ClaudeIcon } from "@/assets/logos/ai/claude"

// Targets

type BuiltInTarget = "chatgpt" | "perplexity" | "googleai" | "grok" | "claude"

interface AiTarget {
  /** Unique key for this target. */
  id: string
  /** Display label in the dropdown. */
  label: string
  /** Icon element rendered before the label. */
  icon: React.ReactNode
  /** Brand color class applied when `brandColors` is enabled. */
  brandColorClass?: string
  /**
   * Action when selected.
   * - `"copy"` — copies `value` to clipboard (default)
   * - `"url"` — opens a URL in a new tab (use `getUrl` to provide the URL)
   * - A callback function receiving the value
   */
  action?: "copy" | "url" | ((value: string) => void)
  /** URL builder for `action: "url"`. Receives the value string. */
  getUrl?: (value: string) => string
}

const builtInTargets: Record<BuiltInTarget, AiTarget> = {
  chatgpt: {
    id: "chatgpt",
    label: "Resumir en ChatGPT",
    icon: <ChatGPTIcon />,
    brandColorClass: "text-[#fff]",
    action: "url",
    getUrl: (value) => `https://chatgpt.com/?q=${encodeURIComponent(value)}`,
  },
  perplexity: {
    id: "perplexity",
    label: "Resumir en Perplexity",
    icon: <PerplexityAIIcon />,
    brandColorClass: "text-[#fff]",
    action: "url",
    getUrl: (value) =>
      `https://www.perplexity.ai/search/?q=${encodeURIComponent(value)}`,
  },
  googleai: {
    id: "googleai",
    label: "Resumir en Google AI",
    icon: <GoogleAIIcon />,
    brandColorClass: "text-[#fff]",
    action: "url",
    getUrl: (value) =>
      `https://www.google.com/search?udm=50&aep=11&q=${encodeURIComponent(value)}`,
  },
  grok: {
    id: "grok",
    label: "Resumir en Grok",
    icon: <GrokIcon />,
    brandColorClass: "text-[#fff]",
    action: "url",
    getUrl: (value) => `https://x.com/i/grok?text=${encodeURIComponent(value)}`,
  },
  claude: {
    id: "claude",
    label: "Resumir en Claude",
    icon: <ClaudeIcon />,
    brandColorClass: "text-[#fff]",
    action: "url",
    getUrl: (value) => `https://claude.ai/new?q=${encodeURIComponent(value)}`,
  },
}

function resolveTargets(targets: (BuiltInTarget | AiTarget)[]): AiTarget[] {
  return targets.map((t) => (typeof t === "string" ? builtInTargets[t] : t))
}

const defaultTargets: (BuiltInTarget | AiTarget)[] = [
  "chatgpt",
  "perplexity",
  "googleai",
  "grok",
  "claude",
]

const AI_CONTEXT_PROMPT = `Contexto: Actúa como un experto de alto nivel en la materia del texto que se te proporcionará a continuación. Tu objetivo es procesar la información de forma rigurosa, analítica y perfectamente estructurada.

Tarea:
1. Resumen Ejecutivo: Extrae las ideas centrales, conclusiones o el valor principal del contenido de forma clara y directa.
2. Guías / Tutoriales (Si aplica): Si el texto describe un proceso, desglósalo en un paso a paso secuencial, lógico y fácil de seguir, sin omitir ninguna instrucción.
3. Datos Técnicos y Código (Si aplica): Transcribe con absoluta precisión cualquier fragmento de código, comandos de terminal, configuraciones, fórmulas o datos técnicos. No los simplifiques ni los resumas.

Restricciones Críticas:
- Cero Alucinaciones: Limítate estrictamente a la información provista. No asumas, extrapoles ni inventes datos que no estén explícitamente en el texto.
- Enfoque Local: No utilices fuentes externas ni busques en internet a menos que se te solicite explícitamente.
- Preservación de Detalles: Si el contenido es extenso, condensa la prosa redundante pero mantén intactos todos los detalles técnicos, datos clave y pasos del proceso.
- Atribución: Si el texto original cita fuentes, autores o referencias, inclúyelas claramente en el resultado.

Formato y Entregable:
- Devuelve un documento limpio, usando Markdown (negritas, listas, bloques de código) para facilitar la lectura.
- El resultado debe ser autosuficiente: cualquier persona que no haya leído el texto original debe ser capaz de entender el tema o replicar el tutorial a la perfección.

Contenido:

`

// Component

const VARIANT_MAP: Record<
  string,
  NonNullable<React.ComponentProps<typeof Button>["variant"]>
> = {
  default: "outline",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  primary: "default",
}

interface AiCopyButtonProps extends Omit<
  React.ComponentProps<typeof ButtonGroup>,
  "children"
> {
  /** The string content to copy or send to AI targets. */
  value: string
  /** Primary button label. Defaults to "Copy". */
  label?: string
  /** AI targets shown in the dropdown. Accepts built-in keys or custom target objects. */
  targets?: (BuiltInTarget | AiTarget)[]
  /** Render dropdown icons in their official brand colors. */
  brandColors?: boolean
  /** Callback fired after the primary copy action completes. */
  onCopy?: () => void
  /** Button variant. Maps to shadcn Button variant internally. */
  variant?: "default" | "secondary" | "outline" | "ghost" | "primary"
  /** Button size. */
  size?: "sm" | "default" | "lg"
}

function AiCopyButton({
  value,
  label = "Copiar",
  targets = defaultTargets,
  brandColors = false,
  variant,
  size,
  onCopy,
  className,
  ...props
}: AiCopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const resolved = resolveTargets(targets)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopy?.()
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may be unavailable in insecure contexts
    }
  }

  function handleTarget(target: AiTarget) {
    // Los targets de IA reciben el prompt, el copy usa value crudo
    const aiValue = AI_CONTEXT_PROMPT + value

    if (target.action === "url" && target.getUrl) {
      window.open(target.getUrl(aiValue), "_blank", "noopener,noreferrer")
    } else if (typeof target.action === "function") {
      target.action(aiValue)
    } else {
      // default: copy
      handleCopy()
    }
  }

  const mappedVariant = VARIANT_MAP[variant ?? "default"]

  return (
    <ButtonGroup className={cn(className)} {...props}>
      <Button
        variant={mappedVariant}
        onClick={handleCopy}
        aria-label={copied ? "Copiado" : `${label} al portapapeles`}
      >
        {copied ? <Check className="text-emerald-500" /> : <Copy />}
        {copied ? "Copiado" : label}
      </Button>

      <ButtonGroupSeparator />

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={mappedVariant} size="icon" aria-label="Mas opciones">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuSubContent className="w-48">
          {resolved.map((target) => (
            <DropdownMenuItem
              className="flex gap-2"
              key={target.id}
              onClick={() => handleTarget(target)}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center",
                  brandColors && target.brandColorClass
                    ? target.brandColorClass
                    : "text-muted-foreground"
                )}
              >
                {target.icon}
              </span>
              {target.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}

export {
  AiCopyButton,
  AI_CONTEXT_PROMPT,
  builtInTargets,
  type AiCopyButtonProps,
  type AiTarget,
  type BuiltInTarget,
}
