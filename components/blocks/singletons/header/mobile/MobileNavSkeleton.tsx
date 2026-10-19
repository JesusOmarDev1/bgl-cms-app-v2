import { Skeleton } from "@/components/ui/skeleton"

export function MobileNavSkeleton() {
  return (
    <Skeleton
      aria-hidden="true"
      className="size-10 shrink-0 rounded-full min-[1366px]:hidden"
    />
  )
}
