import { Suspense } from "react"

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<div>My Page</div>}>
      <SlugContent params={params} />
    </Suspense>
  )
}

async function SlugContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <div>My Page: {slug}</div>
}
