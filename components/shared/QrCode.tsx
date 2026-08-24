import { QRCodeSVG } from "qrcode.react"
import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  /** Content to encode in the QR */
  data: string
  /** QR color (default: currentColor) */
  foreground?: string
  /** Background color (default: transparent) */
  background?: string
  /** Error correction level */
  robustness?: "L" | "M" | "Q" | "H"
  /** QR size in pixels */
  size?: number
  /** URL or path of the center image */
  image?: string
  /** Center image size in pixels */
  imageSize?: number
  /** Whether the image should be excavated from the QR (transparent background around) */
  imageExcavate?: boolean
}

export const QRCode = ({
  data,
  foreground = "#FFF",
  background = "none",
  robustness = "H",
  size = 200,
  image,
  imageSize = 40,
  imageExcavate = true,
  className,
  ...props
}: QRCodeProps) => {
  return (
    <div className={cn("size-full [&_svg]:size-full", className)} {...props}>
      <QRCodeSVG
        value={data}
        size={size}
        bgColor={background}
        fgColor={foreground}
        level={robustness}
        marginSize={0}
        imageSettings={
          image
            ? {
                src: image,
                height: imageSize,
                width: imageSize,
                excavate: imageExcavate,
              }
            : undefined
        }
      />
    </div>
  )
}
