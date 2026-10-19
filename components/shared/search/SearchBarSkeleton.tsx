import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

export function SearchBarSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      aria-hidden
      className={cn(
        "size-10 rounded-full min-[1366px]:h-11 min-[1366px]:w-32 min-[1366px]:rounded-3xl 2xl:w-44",
        className
      )}
    />
  )
}
