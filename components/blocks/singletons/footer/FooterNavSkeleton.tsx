import { Skeleton } from "@/components/ui/skeleton"

export function FooterNavSkeleton() {
  return (
    <footer aria-hidden="true" className="w-full border-b border-transparent">
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
      </div>
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
      </div>
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
      </div>
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
      </div>
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
        </div>
      </div>
    </footer>
  )
}
