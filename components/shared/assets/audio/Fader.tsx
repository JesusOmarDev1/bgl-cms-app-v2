import {
  Slider as SliderPrimitive,
  SliderFill,
  SliderThumb,
  SliderTrack,
  type SliderProps,
} from "react-aria-components"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const faderVariants = cva("", {
  variants: { size: { sm: "", default: "", lg: "" } },
  defaultVariants: { size: "default" },
})

const faderTrackVariants = cva(
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

const faderThumbVariants = cva(
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

const faderThumbMarkVariants = cva("bg-primary opacity-50", {
  variants: { size: { sm: "", default: "", lg: "" } },
  compoundVariants: [
    { size: "sm", class: "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-2.5" },
    { size: "default", class: "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-2.5" },
    { size: "lg", class: "data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-3" },
  ],
  defaultVariants: { size: "default" },
})

type FaderProps = Omit<
  SliderProps<number>,
  "className" | "maxValue" | "minValue" | "onChange" | "onChangeEnd"
> &
  VariantProps<typeof faderVariants> & {
    className?: string
    disabled?: boolean
    max?: number
    min?: number
    onValueChange?: (value: number) => void
    onValueCommit?: (value: number) => void
    thumbMarks?: number | false
  }

export function Fader({
  className,
  size,
  orientation = "horizontal",
  thumbMarks = 3,
  min = -60,
  max = 6,
  onValueChange,
  onValueCommit,
  disabled,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: FaderProps) {
  return (
    <SliderPrimitive
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=horizontal]:min-w-32",
        className,
        faderVariants({ size })
      )}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-slot="fader"
      isDisabled={disabled}
      maxValue={max}
      minValue={min}
      onChange={onValueChange}
      onChangeEnd={onValueCommit}
      orientation={orientation}
      {...props}
    >
      <SliderTrack className={faderTrackVariants({ size })} data-slot="fader-track">
        <SliderFill
          className={cn(
            "absolute bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full data-[orientation=vertical]:bottom-0"
          )}
        />
      </SliderTrack>
      <SliderThumb
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(faderThumbVariants({ size }), "data-[disabled]:cursor-not-allowed")}
        data-orientation={orientation}
        data-slot="fader-thumb"
      >
        <span
          className={cn(
            "flex h-full w-full items-center justify-center gap-0.5",
            "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:px-1.5 data-[orientation=horizontal]:py-1",
            "data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-1 data-[orientation=vertical]:py-1.5",
            size === "sm" && "data-[orientation=horizontal]:px-1 data-[orientation=horizontal]:py-0.5 data-[orientation=vertical]:px-0.5 data-[orientation=vertical]:py-1",
            size === "lg" && "data-[orientation=horizontal]:px-2 data-[orientation=horizontal]:py-1 data-[orientation=vertical]:px-1 data-[orientation=vertical]:py-2"
          )}
          data-orientation={orientation}
        >
          {thumbMarks !== false &&
            Array.from({ length: thumbMarks }, (_, index) => (
              <span
                className={cn(
                  faderThumbMarkVariants({ size }),
                  "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-2.5"
                )}
                data-orientation={orientation}
                data-slot="fader-mark"
                key={index}
              />
            ))}
        </span>
      </SliderThumb>
    </SliderPrimitive>
  )
}
