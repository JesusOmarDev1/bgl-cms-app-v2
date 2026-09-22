import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

export function SearchBarSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      aria-hidden
      className={cn(
        "size-11 rounded-full lg:h-11 lg:w-48 lg:rounded-3xl",
        className
      )}
    />
  )
}
