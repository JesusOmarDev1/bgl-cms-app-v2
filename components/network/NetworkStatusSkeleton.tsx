import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function NetworkStatusSkeleton() {
  return (
    <Card className="w-full max-w-xl" aria-hidden="true">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Skeleton className="size-6" />
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          <Skeleton className="h-4 w-full" />
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex w-full flex-col items-stretch gap-2">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-24" />
          <span className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardFooter>
    </Card>
  )
}
