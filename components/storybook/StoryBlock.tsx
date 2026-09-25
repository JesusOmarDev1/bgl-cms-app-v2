import type * as React from "react"

import { Box } from "@/components/shared/content/Box"
import { cn } from "cn"

type StoryBlockProps = {
  children: React.ReactNode
  className?: string
}

function StoryBlock({ children, className }: StoryBlockProps) {
  return (
    <Box
      display="flex"
      orientation="vertical"
      align="center"
      justify="center"
      gap={4}
      padding={4}
      className={cn("min-h-screen w-full", className)}
    >
      {children}
    </Box>
  )
}

type StorySectionProps = {
  label: string
  description?: string
  children: React.ReactNode
  className?: string
  /** Stack children vertically instead of the default wrap row. */
  stack?: boolean
}

function StorySection({
  label,
  description,
  children,
  className,
  stack = false,
}: StorySectionProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-4xl flex-col gap-2 font-mono",
        className
      )}
    >
      <span className="text-2xl font-bold">{label}</span>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div
        className={
          stack
            ? "mt-6 flex flex-col gap-2"
            : "flex flex-wrap items-center gap-2"
        }
      >
        {children}
      </div>
    </div>
  )
}

StoryBlock.Section = StorySection

export { StoryBlock, StorySection }
