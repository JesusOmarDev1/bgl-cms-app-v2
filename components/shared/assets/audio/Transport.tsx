import { useState } from "react"
import {
  Slider as SliderPrimitive,
  SliderFill,
  SliderThumb,
  SliderTrack,
  type SliderProps,
} from "react-aria-components"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const transportVariants = cva("", {
  variants: { size: { sm: "", default: "", lg: "" } },
  defaultVariants: { size: "default" },
})

const transportTrackVariants = cva(
  "relative grow cursor-pointer overflow-hidden rounded-full bg-input/90 select-none",
  {
    variants: { size: { sm: "", default: "", lg: "" } },
    compoundVariants: [
      { size: "sm", class: "data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5" },
      { size: "default", class: "data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2" },
      { size: "lg", class: "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5" },
    ],
    defaultVariants: { size: "default" },
  }
)

const transportThumbVariants = cva(
  "absolute z-10 block shrink-0 cursor-grab rounded-full bg-white shadow-md ring-1 ring-black/10 transition-[color,box-shadow,background-color] select-none not-dark:bg-clip-padding before:absolute before:-inset-2 before:content-[''] hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-hidden active:cursor-grabbing data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed motion-reduce:transition-none dark:bg-card dark:ring-foreground/10",
  {
    variants: { size: { sm: "", default: "", lg: "" } },
    compoundVariants: [
      { size: "sm", class: "data-[orientation=horizontal]:h-3.5 data-[orientation=horizontal]:w-5 data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-3.5" },
      { size: "default", class: "data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-6 data-[orientation=vertical]:h-6 data-[orientation=vertical]:w-4" },
      { size: "lg", class: "data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-7 data-[orientation=vertical]:h-7 data-[orientation=vertical]:w-5" },
    ],
    defaultVariants: { size: "default" },
  }
)

const transportThumbMarkVariants = cva("bg-primary opacity-50", {
  variants: { size: { sm: "", default: "", lg: "" } },
  compoundVariants: [
    { size: "sm", class: "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-2.5" },
    { size: "default", class: "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-2.5" },
    { size: "lg", class: "data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-3" },
  ],
  defaultVariants: { size: "default" },
})

type TransportProps = Omit<
  SliderProps<number>,
  "className" | "defaultValue" | "maxValue" | "minValue" | "onChange" | "onChangeEnd" | "onChangeStart" | "value"
> & {
  value: number
  bufferedValue?: number
  onSeek: (value: number) => void
  disabled?: boolean
  freezeValuesWhileDragging?: boolean
  min?: number
  max?: number
  step?: number
  className?: string
} & VariantProps<typeof transportVariants>

function Transport({
  value,
  bufferedValue = 0,
  onSeek,
  size,
  step = 1,
  min = 0,
  max = 100,
  disabled,
  freezeValuesWhileDragging = false,
  className,
  orientation = "horizontal",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: TransportProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [frozenBufferedValue, setFrozenBufferedValue] = useState(bufferedValue)
  const displayedBufferedValue =
    freezeValuesWhileDragging && isDragging ? frozenBufferedValue : bufferedValue
  const buffer = Math.max(0, Math.min(100, ((displayedBufferedValue - min) / (max - min || 1)) * 100))
  return (
    <SliderPrimitive
      className={cn(
        "relative data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        className,
        transportVariants({ size })
      )}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-slot="transport"
      isDisabled={disabled}
      maxValue={max}
      minValue={min}
      onChange={onSeek}
      onChangeEnd={() => setIsDragging(false)}
      onPointerDownCapture={() => {
        setFrozenBufferedValue(bufferedValue)
        setIsDragging(true)
      }}
      orientation={orientation}
      step={step}
      value={value}
      {...props}
    >
      <div
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=horizontal]:min-w-32",
          "data-[disabled]:opacity-50"
        )}
        data-orientation={orientation}
      >
        <SliderTrack
          className={transportTrackVariants({ size })}
          data-slot="transport-track"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute z-0 bg-primary/40 select-none",
              orientation === "horizontal"
                ? "inset-y-0 left-0"
                : "inset-x-0 bottom-0"
            )}
            data-slot="transport-buffered"
            style={
              orientation === "horizontal"
                ? { width: `${buffer}%` }
                : { height: `${buffer}%` }
            }
          />
          <SliderFill
            className={cn(
              "absolute z-1 bg-primary select-none",
              orientation === "horizontal"
                ? "inset-y-0 left-0"
                : "inset-x-0 bottom-0"
            )}
          />
        </SliderTrack>
        <SliderThumb
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={transportThumbVariants({ size })}
          data-orientation={orientation}
        >
          <span
            className={cn(
              "flex h-full w-full items-center justify-center",
              orientation === "horizontal"
                ? "flex-row px-1.5 py-1"
                : "flex-col px-1 py-1.5",
              size === "sm" &&
                (orientation === "horizontal"
                  ? "px-1 py-0.5"
                  : "px-0.5 py-1"),
              size === "lg" &&
                (orientation === "horizontal"
                  ? "px-2 py-1"
                  : "px-1 py-2")
            )}
          >
            <span
              className={cn(
                transportThumbMarkVariants({ size }),
                orientation === "horizontal"
                  ? "h-2.5 w-px"
                  : "h-px w-2.5"
              )}
            />
          </span>
        </SliderThumb>
      </div>
    </SliderPrimitive>
  )
}

export { Transport }
