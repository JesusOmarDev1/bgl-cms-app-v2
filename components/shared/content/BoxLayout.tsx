import { cn } from "@/lib/utils"
import { Box, type BoxProps } from "@/components/shared/content/Box"

function BoxContainer({ className, ...props }: BoxProps) {
  return (
    <Box
      paddingInline={{ base: 1, sm: 1.5, lg: 2 }}
      {...props}
      className={cn("mx-auto w-full max-w-7xl", className)}
    />
  )
}

/** Measure-only (`max-w-prose`). Compose Typeset at the caller when needed. CMS HTML uses `SafeHtml`. */
function BoxProse({ className, ...props }: BoxProps) {
  return (
    <Box {...props} className={cn("mx-auto w-full max-w-prose", className)} />
  )
}

function BoxSidebarLayout({ className, ...props }: BoxProps) {
  return (
    <Box
      display="grid"
      {...props}
      className={cn(
        "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8",
        className
      )}
    />
  )
}

function BoxSidebar({ className, ...props }: BoxProps) {
  return (
    <Box
      {...props}
      className={cn("lg:sticky lg:top-24 lg:self-start", className)}
    />
  )
}

function BoxMain({ className, ...props }: BoxProps) {
  return <Box {...props} className={cn("min-w-0", className)} />
}

export { BoxContainer, BoxProse, BoxSidebarLayout, BoxSidebar, BoxMain }
