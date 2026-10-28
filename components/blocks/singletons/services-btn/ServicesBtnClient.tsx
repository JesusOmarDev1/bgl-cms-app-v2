"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ServicesButtonQueryResult } from "@/services/domain/db/queries/singletons/services-button/services-button"
import Link from "next/link"

export function ServicesBtnClient({
  data,
  className,
}: {
  data: NonNullable<ServicesButtonQueryResult>
  className?: string
}) {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        className={className}
        render={
          <Button variant="red" size="xl" className="text-xl font-semibold" />
        }
      >
        <MaterialIcon name="menu" className="text-foreground" />
        {data.title}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{data.title}</DrawerTitle>
          <DrawerDescription render={<Box />}>
            <SafeHtml content={data.excerpt ?? ""} />
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea>
          <ul className="flex flex-col gap-2.5 px-4 pt-5 pb-5">
            {data.services?.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/servicios/${service.item?.slug}`}
                  title={service.item?.title}
                  aria-label={service.item?.title}
                >
                  <Box
                    display="flex"
                    orientation="horizontal"
                    paddingInline={0.5}
                    paddingTop={0.5}
                    paddingBottom={0.5}
                    gap={1}
                    className="rounded-xl hover:bg-accent"
                  >
                    <DirectusImage
                      alt={service.item?.title}
                      src={service.item?.image?.id}
                      title={service.item?.title}
                      variant="thumbnail"
                      className="rounded-xl"
                    />
                    <Box display="flex" gap={0.5} orientation="vertical">
                      <h3 className="text-xl font-bold lg:text-2xl">
                        {service.item?.title}
                      </h3>
                      <SafeHtml
                        content={service.item?.excerpt ?? ""}
                        unstyled
                        className="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2 lg:line-clamp-none"
                      />
                    </Box>
                  </Box>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Cerrar ventana</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
