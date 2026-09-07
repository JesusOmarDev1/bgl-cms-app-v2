import { Skeleton } from "@/components/ui/skeleton"

export function HeaderNavSkeleton() {
  return (
    <header
      aria-hidden="true"
      className="fixed top-0 z-50 w-full border-b border-transparent"
    >
      <div className="mx-auto flex h-24 w-full items-center justify-between px-6">
        <Skeleton className="h-24 w-24" />
      </div>
    </header>
  )
}
