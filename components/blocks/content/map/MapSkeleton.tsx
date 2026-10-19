import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MapSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="aspect-video min-h-80 w-full rounded-none" />
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col items-center justify-center gap-2.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardFooter>
    </Card>
  )
}
