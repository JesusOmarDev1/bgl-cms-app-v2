import { Skeleton } from "@/components/ui/skeleton"

export function MaintenanceViewSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-card p-4">
      <Skeleton className="h-full w-full max-w-xl" />
      <Skeleton className="h-full w-full max-w-xl" />
      <Skeleton className="h-full w-full max-w-xl" />
      <Skeleton className="h-full w-full max-w-xl" />
    </div>
  )
}
