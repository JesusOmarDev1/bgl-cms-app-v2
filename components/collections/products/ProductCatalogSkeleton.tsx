import { Box } from "@/components/shared/content/Box"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CatalogToolBarSkeleton } from "@/components/collections/catalog/CatalogToolBarSkeleton"

export type ProductCatalogStage = "categories" | "types" | "products"

type NavigationStage = Extract<ProductCatalogStage, "categories" | "types">

export function CatalogNavigationCardSkeleton({
  variant,
}: {
  variant: NavigationStage
}) {
  return (
    <Card className="h-full overflow-hidden p-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardHeader className="p-5">
        <CardTitle>
          <Skeleton
            className={variant === "categories" ? "h-6 w-2/3" : "h-6 w-3/4"}
          />
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

function CatalogNavigationGridSkeleton({
  variant,
}: {
  variant: NavigationStage
}) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index}>
          <CatalogNavigationCardSkeleton variant={variant} />
        </li>
      ))}
    </ul>
  )
}

function CatalogBreadcrumbSkeleton({ stage }: { stage: "types" | "products" }) {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-24" />
      {stage === "products" ? <Skeleton className="h-4 w-28" /> : null}
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full pt-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </CardHeader>
      <div className="mt-auto flex items-end justify-between gap-3 px-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </Card>
  )
}

function ProductCardGridSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="list-none"
      cols={{ base: 1, sm: 2, lg: 3 }}
      display="grid"
      gap={2}
      render={(props) => <ul {...props} />}
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li className="min-w-0" key={index}>
          <ProductCardSkeleton />
        </li>
      ))}
    </Box>
  )
}

export function ProductCatalogSkeleton({
  stage,
}: {
  stage: ProductCatalogStage
}) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      {stage === "categories" ? null : (
        <CatalogBreadcrumbSkeleton stage={stage} />
      )}
      {stage === "products" ? (
        <>
          <CatalogToolBarSkeleton variant="products" />
          <ProductCardGridSkeleton />
        </>
      ) : (
        <CatalogNavigationGridSkeleton variant={stage} />
      )}
    </div>
  )
}
