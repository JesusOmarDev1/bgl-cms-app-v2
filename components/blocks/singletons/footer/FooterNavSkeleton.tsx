import { Box } from "@/components/shared/content/Box"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

function column() {
  return (
    <div>
      <Skeleton className="mb-3 h-5 w-24" />
      <ul className="flex flex-col gap-2">
        <li>
          <Skeleton className="h-4 w-36" />
        </li>
        <li>
          <Skeleton className="h-4 w-32" />
        </li>
        <li>
          <Skeleton className="h-4 w-40" />
        </li>
        <li>
          <Skeleton className="h-4 w-28" />
        </li>
      </ul>
    </div>
  )
}

function band() {
  return (
    <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
      <Skeleton className="h-9 w-40 md:h-10" />
      <div className="flex-1">
        <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    </div>
  )
}

export function FooterNavSkeleton() {
  return (
    <footer aria-hidden="true">
      <Box display="grid" cols={1} paddingInline={2}>
        <div className="grid grid-cols-1 place-content-center items-center gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:place-content-start lg:items-start">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="size-20" />
            <Skeleton className="mt-1 h-12 w-full max-w-xs" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          {column()}
          {column()}
          {column()}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {band()}
          {band()}
          {band()}
          {band()}
          <Separator className="mt-0.5 mb-4" orientation="horizontal" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-5 w-80 max-w-full" />
            <Skeleton className="h-12 w-full lg:h-24" />
          </div>
        </div>
      </Box>
    </footer>
  )
}
