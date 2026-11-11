"use client"

import { AnimatePresence, LazyMotion, domAnimation } from "motion/react"
import * as m from "motion/react-m"
import * as React from "react"

import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <LazyMotion features={domAnimation}>
      <InputGroup className={className}>
        <InputGroupAddon align="inline-start">
          <MaterialIcon name="key" />
        </InputGroupAddon>
        <InputGroupInput type={visible ? "text" : "password"} {...props} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={visible ? "hide" : "show"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                <MaterialIcon
                  name={visible ? "visibility_off" : "visibility"}
                />
              </m.span>
            </AnimatePresence>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </LazyMotion>
  )
}

export { PasswordInput }
