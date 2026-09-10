"use client"

import {
  AnimatePresence,
  LazyMotion,
  animate,
  domAnimation,
  useReducedMotion,
} from "motion/react"
import * as m from "motion/react-m"

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

export type InputClassNames = {
  root?: string
  label?: string
  field?: string
  input?: string
  leftIcon?: string
  rightIcon?: string
  successIcon?: string
  errorMessage?: string
}

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
> {
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Truthy error triggers a shake, red border and (if a string) a message. */
  error?: string | boolean
  /** Reserve one message line so validation does not shift nearby content. */
  reserveErrorLine?: boolean
  success?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  classNames?: InputClassNames
}

function resolveInputFieldState(
  hasError: boolean,
  success: boolean | undefined,
  focused: boolean
) {
  if (hasError) return "error"
  if (success) return "success"
  if (focused) return "focused"
  return "idle"
}

function InputSuccessIcon({
  reduce,
  className,
}: {
  reduce: boolean | null
  className?: string
}) {
  return (
    <m.svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "absolute end-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-(--color-success)",
        className
      )}
    >
      <m.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </m.svg>
  )
}

function InputErrorMessage({
  id,
  message,
  reduce,
  className,
}: {
  id: string
  message: string
  reduce: boolean | null
  className?: string
}) {
  return (
    <m.p
      id={id}
      role="alert"
      initial={
        reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={
        reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }
      }
      transition={{ duration: 0.2 }}
      className={cn("px-1 text-xs text-destructive", className)}
    >
      {message}
    </m.p>
  )
}

type InputFieldProps = {
  fieldRef: React.RefObject<HTMLDivElement | null>
  id: string
  value: string
  disabled?: boolean
  hasError: boolean
  success?: boolean
  focused: boolean
  leftIcon?: ReactNode
  rightSlot: ReactNode | null
  reduce: boolean | null
  classNames?: InputClassNames
  type?: string
  onChange: (value: string) => void
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  inputRef: React.ForwardedRef<HTMLInputElement>
  rest: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "onFocus" | "onBlur" | "id" | "type"
  >
}

function InputField({
  fieldRef,
  id,
  value,
  disabled,
  hasError,
  success,
  focused,
  leftIcon,
  rightSlot,
  reduce,
  classNames,
  type,
  onChange,
  onFocus,
  onBlur,
  inputRef,
  rest,
}: InputFieldProps) {
  return (
    <div
      ref={fieldRef}
      data-state={resolveInputFieldState(hasError, success, focused)}
      className={cn(
        "relative h-11 overflow-hidden rounded-full border transition-colors duration-200",
        "border-border",
        focused && !hasError && "border-foreground/40 ring-2 ring-ring/40",
        hasError && "border-destructive ring-2 ring-destructive/25",
        disabled && "opacity-60",
        classNames?.field
      )}
    >
      {leftIcon ? (
        <span
          className={cn(
            "pointer-events-none absolute start-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4",
            classNames?.leftIcon
          )}
        >
          {leftIcon}
        </span>
      ) : null}

      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        {...rest}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          "peer h-full w-full bg-transparent text-base leading-6 text-foreground caret-foreground outline-none",
          "placeholder:text-muted-foreground/60",
          leftIcon ? "ps-10" : "ps-3.5",
          rightSlot || success ? "pe-10" : "pe-3.5",
          disabled && "cursor-not-allowed",
          classNames?.input
        )}
      />

      {success ? (
        <InputSuccessIcon reduce={reduce} className={classNames?.successIcon} />
      ) : rightSlot ? (
        <span
          className={cn(
            "absolute end-0 top-0 flex h-full items-center text-muted-foreground [&_button]:grid [&_button]:size-11 [&_button]:place-items-center [&_svg]:h-4 [&_svg]:w-4",
            classNames?.rightIcon
          )}
        >
          {rightSlot}
        </span>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    value: valueProp,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    error,
    reserveErrorLine = false,
    success,
    leftIcon,
    rightIcon,
    className,
    classNames,
    disabled,
    id: idProp,
    type,
    ...rest
  },
  ref
) {
  const reactId = useId()
  const id = idProp ?? reactId
  const reduce = useReducedMotion()

  const controlled = valueProp !== undefined
  const [internal, setInternal] = useState(defaultValue ?? "")
  const value = controlled ? (valueProp ?? "") : internal

  const [focused, setFocused] = useState(false)

  const fieldRef = useRef<HTMLDivElement>(null)

  const hasError = Boolean(error)
  const errorMessage = typeof error === "string" ? error : null

  // Right edge shows the success check, otherwise the caller's right icon.
  const rightSlot = success ? null : rightIcon

  // Shake the field when an error appears.
  useEffect(() => {
    if (!fieldRef.current || reduce || !hasError) return
    animate(
      fieldRef.current,
      { x: [0, -6, 6, -4, 4, -2, 0] },
      { duration: 0.45 }
    )
  }, [hasError, reduce])

  const handleChange = (next: string) => {
    if (!controlled) setInternal(next)
    onChange?.(next)
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className={cn("flex flex-col gap-1.5", className, classNames?.root)}>
        {label ? (
          <label
            htmlFor={id}
            className={cn(
              "px-1 text-sm font-medium text-foreground",
              classNames?.label
            )}
          >
            {label}
          </label>
        ) : null}

        <InputField
          fieldRef={fieldRef}
          id={id}
          value={value}
          disabled={disabled}
          hasError={hasError}
          success={success}
          focused={focused}
          leftIcon={leftIcon}
          rightSlot={rightSlot}
          reduce={reduce}
          classNames={classNames}
          type={type}
          onChange={handleChange}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          inputRef={ref}
          rest={rest}
        />

        <div className={reserveErrorLine ? "min-h-4" : "contents"}>
          <AnimatePresence initial={false}>
            {errorMessage ? (
              <InputErrorMessage
                id={`${id}-error`}
                message={errorMessage}
                reduce={reduce}
                className={classNames?.errorMessage}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  )
})
