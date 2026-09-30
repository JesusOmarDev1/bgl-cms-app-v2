"use client"
import React from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { MaterialIcon } from "../assets/icons/MaterialIcon"

export interface ScrollToTopButtonProps {
  className?: string
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

export function ScrollToTopButton({
  className,
}: ScrollToTopButtonProps): React.JSX.Element {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return (
    <Button
      onClick={scrollToTop}
      aria-label="Volver arriba"
      variant="glass"
      className={cn(
        "inline-flex size-14 cursor-pointer items-center justify-center rounded-full shadow-lg md:size-16",
        "transition-all duration-300 ease-in-out",
        "hover:-translate-y-0.5 hover:shadow-xl",
        "active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-75 opacity-0",
        className
      )}
      size={"icon"}
    >
      <MaterialIcon name="arrow_upward" size={24} />
    </Button>
  )
}
