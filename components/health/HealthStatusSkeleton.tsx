"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function HealthStatusSkeleton() {
  return (
    <Card className="w-full max-w-xl" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Skeleton className="h-5 w-full" />
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardFooter>
    </Card>
  )
}
