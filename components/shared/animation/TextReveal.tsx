"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { motion, stagger, useAnimate } from "motion/react"

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
      <motion.div ref={scope}>
        {textArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="inline-block"
              style={{
                filter: filter ? "blur(8px)" : "none",
                marginRight: "0.25rem",
                opacity: 0,
              }}
            >
              {word}
            </motion.span>
          )
        })}
      </motion.div>
    </div>
  )
}

export default TextReveal
