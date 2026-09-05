import { BarsRotateDots } from "@/assets/loaders/BarsRotateDots"
import { Box } from "@/components/shared/content/Box"
import Image from "next/image"

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
        <Image src="/favicon.svg" alt="Logo" width={100} height={100} />
        <BarsRotateDots />
      </div>
    </Box>
  )
}
