"use client"

import { usePathname, useRouter } from "next/navigation"
import { RouterProvider } from "react-aria-components"
import { useAction } from "next-safe-action/hooks"
import { useTranslations } from "next-intl"
import { useState, type ReactNode } from "react"
import { StaticLogo } from "@/assets/logos/static-logo"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { logout } from "@/services/domain/server/auth/logout"
import { SettingsDialog } from "@/components/shared/settings/SettingsDialog"
import type { SessionIdentityTypes } from "@/types/collections/session"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "cn"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
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
        href={item.href}
      >
        <MaterialIcon name={item.icon} size={20} />
        <span>{t(`nav.${item.label}`)}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ user }: { user: ReactNode }) {
  const t = useTranslations("dashboard")
  const router = useRouter()

  return (
    <RouterProvider navigate={(href) => router.push(href)}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-12 items-center gap-2.5 px-2 group-data-[collapsible=icon]:justify-center">
            <StaticLogo className="aspect-auto h-8 w-auto shrink-0" />
            <span className="min-w-0 truncate font-heading text-sm font-medium group-data-[collapsible=icon]:hidden">
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
    </RouterProvider>
  )
}

function UserMenuAvatar({
  avatar,
  initials,
  className,
}: {
  avatar: string | null
  initials: string
  className?: string
}) {
  if (avatar) {
    return (
      <DirectusImage
        src={avatar}
        variant="square"
        sizing="fill"
        sizes="32px"
        alt=""
        className={cn("size-6 shrink-0 rounded-full", className)}
        imgClassName="rounded-full"
      />
    )
  }
  return <span className={cn("text-xs", className)}>{initials}</span>
}

function UserMenu({
  name,
  email,
  initials,
  avatar = null,
  identity = null,
}: {
  name: string
  email: string
  initials: string
  avatar?: string | null
  identity?: SessionIdentityTypes | null
}) {
  const t = useTranslations("dashboard")
  const ta = useTranslations("auth")
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
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
    <>
      <DropdownMenuTrigger>
        {collapsed ? (
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon-xs"
              className="rounded-full border bg-card p-0 font-heading text-xs font-semibold hover:bg-sidebar-accent dark:bg-input/30"
              aria-label={t("openMenu")}
            >
              {avatar ? (
                <UserMenuAvatar avatar={avatar} initials={initials} />
              ) : (
                initials
              )}
            </Button>
            <Tooltip placement="right">
              {name || email || t("openMenu")}
            </Tooltip>
          </TooltipTrigger>
        ) : (
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-2 rounded-md border p-2 hover:bg-sidebar-accent"
            aria-label={t("openMenu")}
          >
            <UserMenuAvatar
              avatar={avatar}
              initials={initials}
              className="size-8 shrink-0 border bg-card font-heading"
            />
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
          <DropdownMenuItem onAction={() => setSettingsOpen(true)}>
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
      <SettingsDialog
        identity={identity}
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
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
