import { Skeleton } from "@/components/ui/skeleton"

export function MobileNavSkeleton() {
  return (
    <Skeleton
      aria-hidden="true"
      className="size-8 shrink-0 rounded-lg lg:hidden"
    />
  )
}
