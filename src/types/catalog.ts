export type ImageUrls = { thumb: string; card: string; detail: string };

export type ProductImage = {
  id: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
  variant: string | null;
  urls: ImageUrls;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  position: number;
};

export type Brand = { id: number; name: string; slug: string };

export type MoneyDisplay = {
  base_amount: string;
  base_currency: string;
  currency: string;
  amount: string;
  formatted: string;
  rate: string;
  converted: boolean;
};

export type OptionValue = { id: number; value: string; position: number };
export type OptionType = {
  id: number;
  name: string;
  position: number;
  values: OptionValue[];
};

export type Variant = {
  id: string;
  sku: string;
  price: string;
  is_default: boolean;
  options_key: string;
  option_value_ids: number[];
  fulfillment_type: "internal" | "dropship";
  available: number;
  in_stock: boolean;
  images: ProductImage[];
  price_display: MoneyDisplay | null;
};

export type ProductListItem = {
  id: string;
  title: string;
  slug: string;
  short_id: string;
  category: Category | null;
  brand: Brand | null;
  price_from: string | null;
  price_from_display: MoneyDisplay | null;
  primary_image: ImageUrls | null;
  share_path: string;
};

export type ProductDetail = {
  id: string;
  title: string;
  slug: string;
  short_id: string;
  description: string;
  category: Category | null;
  brand: Brand | null;
  fulfillment_type: string;
  option_types: OptionType[];
  variants: Variant[];
  images: ProductImage[];
  share_path: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/** A product as returned by the admin API (read/write shape). */
export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  short_id: string;
  description: string;
  features: string;
  category: number | null;
  brand: number | null;
  fulfillment_type: "internal" | "dropship";
  is_active: boolean;
  discount_percent: string;
  primary_image: string | null;
  variant_count: number;
  price_from: string | null;
  rating_avg: string;
  rating_count: number;
};

export type PriceTier = { min_qty: number; price: string };

export type AdminVariant = {
  id: string;
  sku: string;
  price: string;
  cost_price: string;
  moq: number;
  price_tiers: PriceTier[];
  is_active: boolean;
  is_default: boolean;
  fulfillment_type: "internal" | "dropship";
  options_key: string;
};

export type AdminOptionType = {
  id: number;
  name: string;
  position: number;
  values: { id: number; value: string; position: number }[];
};

export type StockItem = {
  id: string;
  variant: string;
  on_hand: number;
  reserved: number;
  available: number;
  sku: string;
};
