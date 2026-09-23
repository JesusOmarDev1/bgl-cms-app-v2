"use client"

import { type ComponentProps } from "react"

import { cn } from "cn"
import useCopyToClipboard from "@/hooks/useCopyToClipboard"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import showToast from "@/hooks/useToast"
import { Button } from "@/components/ui/button"

interface CopyButtonProps extends ComponentProps<"button"> {
  content: string
}

const CopyButton = ({ content, className, ...props }: CopyButtonProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard()

  const handleCopy = async () => {
    await copyToClipboard(content)
    showToast({
      title: "Copiado al portapapeles",
      message: "El contenido ha sido copiado al portapapeles",
      variant: "info",
    })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Copiar ${content} al portapapeles`}
      className={cn("rounded-full", className)}
      onPress={async () => await handleCopy()}
    >
      {isCopied ? (
        <MaterialIcon
          size={18}
          name="check"
          className="animate-in text-green-900 duration-200 zoom-in-50 dark:text-green-400"
        />
      ) : (
        <MaterialIcon
          size={18}
          name="content_copy"
          className="animate-in duration-200 zoom-in-50"
        />
      )}
    </Button>
  )
}

export { CopyButton }
