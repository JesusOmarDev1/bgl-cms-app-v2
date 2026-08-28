import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { HealthStatus } from "@/components/health/HealthStatus"
import { HealthStatusSkeleton } from "@/components/health/HealthStatusSkeleton"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button variant={"red"} className="mt-2">
            Button
          </Button>
        </div>
        <Suspense
          defer
          name="health-status"
          key="health-status"
          fallback={<HealthStatusSkeleton />}
        >
          <HealthStatus />
        </Suspense>
      </div>
    </div>
  )
}
