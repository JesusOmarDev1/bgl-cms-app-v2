import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="relative h-dvh w-full overflow-hidden"
    >
      <div className="relative z-10 flex h-full w-full min-w-0 flex-col pt-24">
        <BoxContainer display="flex" gap={2} orientation="vertical">
          <div className="flex max-w-3xl flex-col gap-4">
            <Skeleton className="h-[37.5px] w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-9 w-36" />
          </div>
        </BoxContainer>
      </div>
    </section>
  )
}
