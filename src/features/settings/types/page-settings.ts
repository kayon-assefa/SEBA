export type PageSection =
  | "business_profile"
  | "about"
  | "services"
  | "appointments"
  | "shop"
  | "gallery"
  | "reviews"
  | "location"
  | "social_links";

export type PageSettings = {
  template_id: number | null;

  sections: Record<
    PageSection,
    boolean
  >;

  page_title: string | null;
  meta_description: string | null;
  search_keywords: string[];

  social_sharing_image: string | null;

  primary_color?: string | null;
  secondary_color?: string | null;

  font_family?: string | null;
  button_style?: string | null;
  border_radius?: string | null;

  animations_enabled?: boolean;
};

export type PageTheme = {
  business_id: string;

  [key: string]: unknown;
};

export type PageSettingsUpdate =
  Partial<PageSettings>;

export type SEOSettings = {
  page_title: string;
  meta_description: string;
  search_keywords: string[];
  social_sharing_image: string | null;
};

export type PublicPageInfo = {
  username: string;
  url: string;
};