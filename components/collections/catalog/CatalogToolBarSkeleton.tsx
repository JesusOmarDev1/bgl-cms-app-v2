import { Skeleton } from "@/components/ui/skeleton"

export function CatalogToolBarSkeleton({
  variant = "default",
}: {
  variant?: "default" | "products"
}) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 lg:flex-row">
      {variant === "default" ? (
        <Skeleton className="h-8 w-full lg:w-64" />
      ) : null}
      <Skeleton className="h-8 min-w-0 flex-1" />
      {variant === "products" ? (
        <>
          <Skeleton className="h-8 w-full lg:w-48" />
          <Skeleton className="h-8 w-full lg:w-48" />
          <Skeleton className="h-8 w-full lg:w-48" />
        </>
      ) : null}
      <Skeleton className="h-8 w-full lg:w-48" />
    </div>
  )
}
