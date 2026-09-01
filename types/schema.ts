import type { BrandsBlock } from "@/types/blocks/content/brands-block"
import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { CarouselItemsBlock } from "@/types/blocks/carousel/carousel-items-block"
import type { CheckboxBlock } from "@/types/blocks/form/fields/checkbox-block"
import type { ClientsBlock } from "@/types/blocks/content/clients-block"
import type { ContactBlock } from "@/types/blocks/content/contact-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { ContentColumnBlock } from "@/types/blocks/content/html/content-column-block"
import type { CtaBlock } from "@/types/blocks/content/cta-block"
import type { DateBlock } from "@/types/blocks/form/fields/date-block"
import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { EmailBlock } from "@/types/blocks/form/fields/email-block"
import type { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { FaqQuestions } from "@/types/blocks/faq/faq-questions"
import type { FeaturedProductsBlock } from "@/types/blocks/content/featured-products-block"
import type { FeaturedServicesBlock } from "@/types/blocks/content/services/featured-services-block"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { MapBlock } from "@/types/blocks/content/map-block"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { NumberBlock } from "@/types/blocks/form/fields/number-block"
import type { PhoneBlock } from "@/types/blocks/form/fields/phone-block"
import type { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
import type { SuppliersBlock } from "@/types/blocks/content/suppliers-block"
import type { TextAreaBlock } from "@/types/blocks/form/fields/text-area-block"
import type { TextBlock } from "@/types/blocks/form/fields/text-block"
import type { BlogCategoriesTypes } from "@/types/collections/blog-categories"
import type { BlogPostsTypes } from "@/types/collections/blog-posts"
import type { BrandsTypes } from "@/types/collections/brands"
import type { ClientsTypes } from "@/types/collections/clients"
import type { DivisionServicesTypes } from "@/types/collections/division-services"
import type { EmailTypes } from "@/types/collections/emails"
import type { BlogPostsBodyJunction } from "@/types/collections/junctions/blog-posts-body"
import type { BlogPostsTagsJunction } from "@/types/collections/junctions/blog-posts-tags"
import type { BrandsModelsJunction } from "@/types/collections/junctions/brands-models"
import type { FooterEmailsJunction } from "@/types/collections/junctions/footer-emails"
import type { FooterPhonesJunction } from "@/types/collections/junctions/footer-phones"
import type { FooterSocialLinksJunction } from "@/types/collections/junctions/footer-social-links"
import type { FooterUrlLinksJunction } from "@/types/collections/junctions/footer-url-links"
import type { HeaderSocialLinksJunction } from "@/types/collections/junctions/header-social-links"
import type { HeaderUrlLinksJunction } from "@/types/collections/junctions/header-url-links"
import type { ManualsBodyJunction } from "@/types/collections/junctions/manuals-body"
import type { ModelsFilesJunction } from "@/types/collections/junctions/models-files"
import type { PagesBodyJunction } from "@/types/collections/junctions/pages-body"
import type { ProductsFilesJunction } from "@/types/collections/junctions/products-files"
import type { ProductsProductAttributesJunction } from "@/types/collections/junctions/products-product-attributes"
import type { ProductsProductsJunction } from "@/types/collections/junctions/products-products"
import type { ProductsTagsJunction } from "@/types/collections/junctions/products-tags"
import type { ServicesBodyJunction } from "@/types/collections/junctions/services-body"
import type { ServicesButtonServicesJunction } from "@/types/collections/junctions/services-button-services"
import type { UrlLinksSubLinksJunction } from "@/types/collections/junctions/url-links-sub-links"
import type { ManualCategoriesTypes } from "@/types/collections/manual-categories"
import type { ManualsTypes } from "@/types/collections/manuals"
import type { ModelsTypes } from "@/types/collections/models"
import type { PagesTypes } from "@/types/collections/pages"
import type { PhoneTypes } from "@/types/collections/phones"
import type { ProductAttributesTypes } from "@/types/collections/product-attributes"
import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { ProductsTypes } from "@/types/collections/products"
import type { RedirectsTypes } from "@/types/collections/redirects"
import type { SeoTypes } from "@/types/collections/seo"
import type { ServicesCategoriesTypes } from "@/types/collections/services-categories"
import type { ServicesTypes } from "@/types/collections/services"
import type { SocialLinksTypes } from "@/types/collections/social-links"
import type { SubLinksTypes } from "@/types/collections/sub-links"
import type { SuppliersTypes } from "@/types/collections/suppliers"
import type { TagTypes } from "@/types/collections/tags"
import type { UrlLinksTypes } from "@/types/collections/url-links"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { FooterType } from "@/types/singletons/footer"
import type { HeaderType } from "@/types/singletons/header"
import type { ServicesButtonType } from "@/types/singletons/services-button"
import type { SiteSettingsType } from "@/types/singletons/site-settings"
import type { WhatsappButtonType } from "@/types/singletons/whatsapp-button"

export interface Schema {
  pages: PagesTypes[]
  blog_posts: BlogPostsTypes[]
  blog_categories: BlogCategoriesTypes[]
  services: ServicesTypes[]
  services_categories: ServicesCategoriesTypes[]
  division_services: DivisionServicesTypes[]
  manuals: ManualsTypes[]
  manual_categories: ManualCategoriesTypes[]
  products: ProductsTypes[]
  product_categories: ProductCategoriesTypes[]
  product_attributes: ProductAttributesTypes[]
  brands: BrandsTypes[]
  clients: ClientsTypes[]
  suppliers: SuppliersTypes[]
  models: ModelsTypes[]
  emails: EmailTypes[]
  phones: PhoneTypes[]
  seo: SeoTypes[]
  redirects: RedirectsTypes[]
  tags: TagTypes[]
  social_links: SocialLinksTypes[]
  url_links: UrlLinksTypes[]
  sub_links: SubLinksTypes[]
  faq_block: FaqBlock[]
  map_block: MapBlock[]
  content_block: ContentBlock[]
  cta_block: CtaBlock[]
  form_block: FormBlock[]
  hero_block: HeroBlock[]
  qr_code_block: QrCodeBlock[]
  media_block: MediaBlock[]
  featured_services_block: FeaturedServicesBlock[]
  featured_products_block: FeaturedProductsBlock[]
  logos_clients_block: LogosClientsBlock[]
  division_services_block: DivisionServicesBlock[]
  contact_block: ContactBlock[]
  content_column_block: ContentColumnBlock[]
  faq_questions: FaqQuestions[]
  carousel_block: CarouselBlock[]
  clients_block: ClientsBlock[]
  suppliers_block: SuppliersBlock[]
  brands_block: BrandsBlock[]
  carousel_items_block: CarouselItemsBlock[]
  email_block: EmailBlock[]
  date_block: DateBlock[]
  number_block: NumberBlock[]
  text_block: TextBlock[]
  text_area_block: TextAreaBlock[]
  checkbox_block: CheckboxBlock[]
  phone_block: PhoneBlock[]
  directus_files: DirectusFileTypes[]
  pages_body: PagesBodyJunction[]
  blog_posts_body: BlogPostsBodyJunction[]
  manuals_body: ManualsBodyJunction[]
  services_body: ServicesBodyJunction[]
  header_url_links: HeaderUrlLinksJunction[]
  header_social_links: HeaderSocialLinksJunction[]
  footer_url_links: FooterUrlLinksJunction[]
  footer_social_links: FooterSocialLinksJunction[]
  footer_phones: FooterPhonesJunction[]
  footer_emails: FooterEmailsJunction[]
  services_button_services: ServicesButtonServicesJunction[]
  blog_posts_tags: BlogPostsTagsJunction[]
  products_tags: ProductsTagsJunction[]
  products_files: ProductsFilesJunction[]
  products_product_attributes: ProductsProductAttributesJunction[]
  products_products: ProductsProductsJunction[]
  url_links_sub_links: UrlLinksSubLinksJunction[]
  brands_models: BrandsModelsJunction[]
  models_files: ModelsFilesJunction[]
  site_settings: SiteSettingsType
  header: HeaderType
  footer: FooterType
  whatsapp_button: WhatsappButtonType
  services_button: ServicesButtonType
}
