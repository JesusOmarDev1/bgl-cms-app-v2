"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { StaticLogo } from "@/assets/logos/static-logo"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { logout } from "@/services/domain/server/auth/logout"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

type NavItem = {
  label: string
  href?: string
  icon: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "operation",
    items: [
      { label: "dashboard", href: "/dashboard", icon: "space_dashboard" },
      { label: "orders", icon: "receipt_long" },
      { label: "movements", icon: "compare_arrows" },
    ],
  },
  {
    label: "catalogs",
    items: [
      { label: "clients", icon: "groups" },
      { label: "scales", icon: "monitor_weight" },
      { label: "inventory", icon: "inventory_2" },
      { label: "brands", icon: "sell" },
      { label: "models", icon: "category" },
      { label: "suppliers", icon: "storefront" },
    ],
  },
]

function NavLink({ item }: { item: NavItem }) {
  const t = useTranslations("dashboard")
  const pathname = usePathname()
  const href = item.href

  if (!href) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isDisabled
          tooltip={`${t(`nav.${item.label}`)} · ${t("comingSoon")}`}
        >
          <MaterialIcon name={item.icon} size={20} />
          <span>{t(`nav.${item.label}`)}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const active = pathname === item.href

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={t(`nav.${item.label}`)}
        render={(props) => (
          <Link
            {...(props as React.ComponentProps<typeof Link>)}
            href={href}
            aria-current={active ? "page" : undefined}
          />
        )}
      >
        <MaterialIcon name={item.icon} size={20} />
        <span>{t(`nav.${item.label}`)}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function PrivateSidebar({ user }: { user: ReactNode }) {
  const t = useTranslations("dashboard")

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2.5 px-2 group-data-[collapsible=icon]:justify-center">
          <StaticLogo className="aspect-auto h-8 w-auto shrink-0" />
          <span className="min-w-0 truncate font-heading text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {t("brand")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{t(`nav.${group.label}`)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavLink key={item.label} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{user}</SidebarFooter>
    </Sidebar>
  )
}

function UserMenu({
  name,
  email,
  initials,
}: {
  name: string
  email: string
  initials: string
}) {
  const t = useTranslations("dashboard")
  const ta = useTranslations("auth")
  const router = useRouter()
  const action = useAction(logout, {
    onSuccess: ({ data }) => {
      if (data?.ok || data?.message === "sessionExpired") {
        router.replace("/login")
        router.refresh()
      }
    },
  })
  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile

  // RAC convention: the trigger element AND the popover both live inside
  // MenuTrigger; the trigger child must be a RAC button to receive the
  // trigger context. Wrapping the trigger inside DropdownMenu renders nothing.
  return (
    <DropdownMenuTrigger>
      {collapsed ? (
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full border bg-card p-0 font-heading text-xs font-semibold hover:bg-sidebar-accent dark:bg-input/30"
            aria-label={t("openMenu")}
          >
            {initials}
          </Button>
          <Tooltip placement="right">{name || email || t("openMenu")}</Tooltip>
        </TooltipTrigger>
      ) : (
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2 rounded-md border p-2 hover:bg-sidebar-accent"
          aria-label={t("openMenu")}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-card font-heading text-xs font-semibold">
            {initials}
          </span>
          <span className="min-w-0 flex-1 text-start">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {email}
            </span>
          </span>
          <MaterialIcon
            className="text-muted-foreground"
            name="unfold_more"
            size={16}
          />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuItem href="/dashboard/configuracion">
          <MaterialIcon name="settings" size={16} />
          {t("nav.configuration")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onAction={() => action.execute({})}
          isDisabled={action.isPending}
        >
          <MaterialIcon name="logout" size={16} />
          {action.isPending ? ta("signingOut") : ta("signOut")}
        </DropdownMenuItem>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

export function SidebarUserFallback() {
  return (
    <div aria-busy className="flex items-center gap-2 rounded-md p-2">
      <span className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
      <span className="flex-1 space-y-1">
        <span className="block h-3 w-24 animate-pulse rounded bg-muted" />
        <span className="block h-2 w-32 animate-pulse rounded bg-muted" />
      </span>
    </div>
  )
}

export { UserMenu }
