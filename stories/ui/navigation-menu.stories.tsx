import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/NavigationMenu",
  component: NavigationMenu,
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("navigation_menu.closed")}
          description={t("navigation_menu.closed_hint")}
        >
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  {t("navigation_menu.products")}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="flex min-w-48 flex-col gap-1 p-2">
                  <NavigationMenuLink
                    render={<a href="#">{t("navigation_menu.docs")}</a>}
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<a href="#">{t("navigation_menu.about")}</a>}
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("navigation_menu.with_link")}
          description={t("navigation_menu.with_link_hint")}
        >
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<a href="#">{t("navigation_menu.products")}</a>}
                />
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<a href="#">{t("navigation_menu.docs")}</a>}
                />
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<a href="#">{t("navigation_menu.about")}</a>}
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
