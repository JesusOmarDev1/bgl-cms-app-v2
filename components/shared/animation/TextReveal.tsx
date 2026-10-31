"use client"

import { cn } from "cn"
import { useEffect } from "react"
import { LazyMotion, domAnimation, stagger, useAnimate } from "motion/react"
import * as m from "motion/react-m"

const defaultRevealText =
  "ForgeUI is a beautifully designed component library built with Tailwind CSS and Motion. It helps developers build modern, animated UIs faster, with consistent styling and production-ready components."

const TextReveal = ({
  text = defaultRevealText,
  className,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.2,
}: {
  text?: string
  className?: string
  filter?: boolean
  duration?: number
  staggerDelay?: number
}) => {
  const [scope, animate] = useAnimate()
  const textArray = text.split(" ")

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration,
        delay: stagger(staggerDelay),
        ease: "easeOut",
      }
    )
  }, [animate, duration, filter, staggerDelay])

  return (
    <div className={cn("leading-normal", className)}>
      <LazyMotion features={domAnimation}>
        <m.div ref={scope}>
          {textArray.map((word, idx) => {
            return (
              <m.span
                key={word + idx}
                className="inline-block"
                style={{
                  filter: filter ? "blur(8px)" : "none",
                  marginRight: "0.25rem",
                  opacity: 0,
                }}
              >
                {word}
              </m.span>
            )
          })}
        </m.div>
      </LazyMotion>
    </div>
  )
}

export default TextReveal
