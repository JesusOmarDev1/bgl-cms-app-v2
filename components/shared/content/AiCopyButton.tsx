"use client"

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
import { useTranslations } from "next-intl"

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

function resolveTargets(
  targets: (BuiltInTarget | AiTarget)[],
  builtIn: Record<BuiltInTarget, AiTarget>
): AiTarget[] {
  return targets.map((target) =>
    typeof target === "string" ? builtIn[target] : target
  )
}

const defaultTargets: (BuiltInTarget | AiTarget)[] = [
  "chatgpt",
  "perplexity",
  "googleai",
  "grok",
  "claude",
]

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
  const t = useTranslations("ai")
  const c = useTranslations("copy_to_clipboard")
  const [copied, setCopied] = React.useState(false)

  const builtInTargets = React.useMemo((): Record<BuiltInTarget, AiTarget> => {
    return {
      chatgpt: {
        id: "chatgpt",
        label: t("chatgpt") as string,
        icon: <ChatGPTIcon />,
        brandColorClass: "text-[#fff]",
        action: "url",
        getUrl: (value) =>
          `https://chatgpt.com/?q=${encodeURIComponent(value)}`,
      },
      perplexity: {
        id: "perplexity",
        label: t("perplexity") as string,
        icon: <PerplexityAIIcon />,
        brandColorClass: "text-[#fff]",
        action: "url",
        getUrl: (value) =>
          `https://www.perplexity.ai/search/?q=${encodeURIComponent(value)}`,
      },
      googleai: {
        id: "googleai",
        label: t("googleai") as string,
        icon: <GoogleAIIcon />,
        brandColorClass: "text-[#fff]",
        action: "url",
        getUrl: (value) =>
          `https://www.google.com/search?udm=50&aep=11&q=${encodeURIComponent(value)}`,
      },
      grok: {
        id: "grok",
        label: t("grok") as string,
        icon: <GrokIcon />,
        brandColorClass: "text-[#fff]",
        action: "url",
        getUrl: (value) =>
          `https://x.com/i/grok?text=${encodeURIComponent(value)}`,
      },
      claude: {
        id: "claude",
        label: t("claude") as string,
        icon: <ClaudeIcon />,
        brandColorClass: "text-[#fff]",
        action: "url",
        getUrl: (value) =>
          `https://claude.ai/new?q=${encodeURIComponent(value)}`,
      },
    }
  }, [t])

  const aiContextPrompt = t("default_prompt") as string
  const resolved = resolveTargets(targets, builtInTargets)

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
    const aiValue = aiContextPrompt + value

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
        aria-label={
          copied
            ? (c("copied") as string)
            : `${label} ${c("clipboard") as string}`
        }
      >
        {copied ? <Check className="text-emerald-500" /> : <Copy />}
        {copied ? (c("copied") as string) : label}
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
  type AiCopyButtonProps,
  type AiTarget,
  type BuiltInTarget,
}
