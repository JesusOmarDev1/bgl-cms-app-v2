import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MaintenanceViewSkeleton() {
  return (
    <main
      aria-hidden="true"
      className="flex min-h-dvh items-center justify-center gap-4 p-6 pt-8"
    >
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-[37.5px] w-2/3" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-7">
            <Skeleton className="h-8 w-32" />
          </CardContent>
          <CardFooter className="px-7">
            <Skeleton className="h-5 w-2/3" />
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
