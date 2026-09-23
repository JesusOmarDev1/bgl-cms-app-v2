import { FacebookIcon } from "@/assets/logos/social/facebook"
import { InstagramIcon } from "@/assets/logos/social/instagram"
import { PinterestIcon } from "@/assets/logos/social/pinterest"
import { TiktokIcon } from "@/assets/logos/social/tiktok"
import { TwitterXIcon } from "@/assets/logos/social/twitterX"
import { WhatsAppIcon } from "@/assets/logos/social/whatsapp"
import { YouTubeIcon } from "@/assets/logos/social/youtube"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { ReactElement } from "react"

interface SocialIconProps {
  type: string
  icon?: ReactElement | null | undefined
}

export function SocialIcon({ type, icon }: SocialIconProps) {
  switch (type) {
    case "facebook":
      return <FacebookIcon className="size-6 lg:size-8" />
    case "x_twitter":
      return <TwitterXIcon className="size-6 lg:size-8" />
    case "instagram":
      return <InstagramIcon className="size-6 lg:size-8" />
    case "pinterest":
      return <PinterestIcon className="size-6 lg:size-8" />
    case "youtube":
      return <YouTubeIcon className="size-6 lg:size-8" />
    case "tiktok":
      return <TiktokIcon className="size-6 lg:size-8" />
    case "whatsapp":
      return <WhatsAppIcon className="size-6 lg:size-8" />
    default:
      return (
        icon || <MaterialIcon name="hide_image" className="size-6 lg:size-8" />
      )
  }
}
