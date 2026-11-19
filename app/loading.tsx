import { BarsRotateDots } from "@/assets/loaders/BarsRotateDots"
import { StaticLogo } from "@/assets/logos/static-logo"
import { Box } from "@/components/shared/content/Box"

export default function Loading() {
  return (
    <Box
      display="flex"
      align="center"
      justify="center"
      className="h-dvh w-full"
      padding={4}
    >
      <div className="flex flex-col items-center gap-4">
        <StaticLogo className="size-28" />
        <BarsRotateDots />
      </div>
    </Box>
  )
}
