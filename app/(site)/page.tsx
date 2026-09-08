import type { Metadata } from "next"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "BGL Básculas Industriales",
  description: "Sitio web de BGL Básculas Industriales.",
}

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <section className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <h1 className="font-medium">Project ready!</h1>
        <p>You may now add components and start building.</p>
        <p>We&apos;ve already added the button component for you.</p>
        <Button variant={"red"} className="mt-2">
          Button
        </Button>
      </section>
    </div>
  )
}
