export type StoreApiImage = {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
};

export type StoreApiPrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: null | {
    min_amount: string;
    max_amount: string;
  };
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
};

export type NutzenProductFields = {
  ingredients?: string;
  composition?: string;
  nutrition?: Array<{ label: string; value: string }>;
  benefits?: string[];
  directions?: string;
  storage?: string;
  pet_size?: string;
  life_stage?: string;
  package_weight?: string;
  technical_information?: string;
  pdf_url?: string;
  complementary_information?: string;
  product_line?: string;
};

export type StoreApiProduct = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: StoreApiPrices;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: StoreApiImage[];
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{
    id: number;
    name: string;
    taxonomy: string;
    has_variations: boolean;
    terms: Array<{ id: number; name: string; slug: string }>;
  }>;
  is_purchasable: boolean;
  is_in_stock: boolean;
  weight?: string;
  formatted_weight?: string;
  low_stock_remaining: number | null;
  add_to_cart: { text: string; description: string; url: string };
  extensions?: {
    "nutzen-fields"?: NutzenProductFields;
  };
};

export type StoreApiCartItem = {
  key: string;
  id: number;
  quantity: number;
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  };
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: StoreApiImage[];
  variation: Array<{ attribute: string; value: string }>;
  prices: StoreApiPrices;
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
};

export type StoreApiCart = {
  items: StoreApiCartItem[];
  coupons: Array<{ code: string; discount_type: string; totals: Record<string, string> }>;
  fees: unknown[];
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string | null;
    total_shipping_tax: string | null;
    total_price: string;
    total_tax: string;
    tax_lines: unknown[];
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;
  needs_payment: boolean;
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
  shipping_rates: Array<{
    package_id: number;
    name: string;
    destination: Record<string, string>;
    shipping_rates: Array<{
      rate_id: string;
      name: string;
      description: string;
      delivery_time: string;
      price: string;
      selected: boolean;
      currency_code: string;
      currency_symbol: string;
      currency_minor_unit: number;
    }>;
  }>;
  payment_requirements: string[];
  extensions: Record<string, unknown>;
};
