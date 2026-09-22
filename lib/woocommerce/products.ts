import {
  products as fallbackProducts,
  type Product,
  type ProductLine,
  type ProductSpecies,
} from "@/app/data/products";
import { isWordPressConfigured, storeApiRequest } from "./client";
import type { StoreApiProduct } from "./types";

export type CommerceCatalog = {
  products: Product[];
  source: "woocommerce" | "fallback";
  fallbackReason?: "not-configured" | "empty-catalog" | "request-failed";
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function minorUnitValue(value: string, minorUnit: number) {
  return Number(value) / 10 ** minorUnit;
}

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}

function productWeightValue(product: Product) {
  const match = product.weight.replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function sortProductsByWeight(products: Product[]) {
  const lineOrder: Record<ProductLine, number> = {
    "medium-large-dogs": 0,
    "small-dogs": 1,
    "neutered-cats": 2,
    other: 3,
  };

  return [...products].sort((left, right) => {
    const lineDifference = lineOrder[left.line] - lineOrder[right.line];
    return lineDifference || productWeightValue(left) - productWeightValue(right) || left.name.localeCompare(right.name, "pt-BR");
  });
}

function inferProductLine(storeProduct: StoreApiProduct): ProductLine {
  const configuredLine = storeProduct.extensions?.["nutzen-fields"]?.product_line;
  if (configuredLine === "medium-large-dogs" || configuredLine === "small-dogs" || configuredLine === "neutered-cats") {
    return configuredLine;
  }

  for (const category of storeProduct.categories) {
    const categoryHint = `${category.slug} ${category.name}`.toLocaleLowerCase("pt-BR");
    if (categoryHint.includes("gato")) return "neutered-cats";
    if (categoryHint.includes("pequen")) return "small-dogs";
    if (categoryHint.includes("media") || categoryHint.includes("média") || categoryHint.includes("grande")) return "medium-large-dogs";
  }

  return "other";
}

function inferSpecies(storeProduct: StoreApiProduct, line: ProductLine): ProductSpecies {
  if (line === "neutered-cats") return "cat";
  const hint = `${storeProduct.name} ${storeProduct.categories.map((category) => category.name).join(" ")}`.toLocaleLowerCase("pt-BR");
  return hint.includes("gato") || hint.includes("felino") ? "cat" : "dog";
}

function getProductWeight(storeProduct: StoreApiProduct) {
  const fields = storeProduct.extensions?.["nutzen-fields"];
  if (fields?.package_weight) return fields.package_weight;

  const weightAttribute = storeProduct.attributes.find((attribute) => {
    const name = attribute.name.toLocaleLowerCase("pt-BR");
    return name.includes("peso") || name.includes("embalagem");
  });
  const attributeValue = weightAttribute?.terms[0]?.name;
  if (attributeValue) return attributeValue;
  if (storeProduct.weight) return `${storeProduct.weight} kg`;
  if (storeProduct.formatted_weight && storeProduct.formatted_weight !== "Não aplicável") return storeProduct.formatted_weight;
  return "Tamanho não informado";
}

function createGenericProduct(storeProduct: StoreApiProduct): Product {
  const fields = storeProduct.extensions?.["nutzen-fields"];
  const line = inferProductLine(storeProduct);
  const species = inferSpecies(storeProduct, line);
  const priceValue = minorUnitValue(storeProduct.prices.price, storeProduct.prices.currency_minor_unit);
  const weight = getProductWeight(storeProduct);
  const remoteImages = storeProduct.images.map((image) => image.src).filter(Boolean);
  const lineNames: Record<ProductLine, string> = {
    "medium-large-dogs": "Médias e grandes",
    "small-dogs": "Raças pequenas",
    "neutered-cats": "Gatos castrados",
    other: "Outros produtos",
  };

  return {
    wooId: storeProduct.id,
    sku: storeProduct.sku,
    stockStatus: storeProduct.is_in_stock ? "instock" : "outofstock",
    slug: storeProduct.slug,
    line,
    species,
    shortName: lineNames[line],
    name: storeProduct.name,
    description: stripHtml(storeProduct.short_description || storeProduct.description) || "Conheça este produto NutzenPet.",
    weight,
    priceValue,
    price: priceValue > 0 ? formatPrice(priceValue, storeProduct.prices.currency_code) : "Preço em breve",
    availableForPurchase: storeProduct.is_purchasable && storeProduct.is_in_stock,
    featured: false,
    sizeOptions: [{ label: weight, slug: storeProduct.slug }],
    accent: species === "cat" ? "#CC632B" : "#3E1255",
    soft: species === "cat" ? "#FFF0E9" : "#F5EEF8",
    images: remoteImages.length > 0 ? remoteImages : ["/logo/logo.png"],
    features: fields?.benefits ?? [],
    nutrition: fields?.nutrition ?? [],
    ingredients: fields?.ingredients || fields?.composition || "Informações em atualização.",
    directions: fields?.directions || "Consulte a embalagem e a orientação do profissional responsável.",
    storage: fields?.storage || "Conserve conforme as instruções da embalagem.",
    feedingGuide: [],
  };
}

export function mergeStoreProduct(storeProduct: StoreApiProduct): Product {
  const visual = fallbackProducts.find((product) => product.slug === storeProduct.slug);
  if (!visual) return createGenericProduct(storeProduct);

  const fields = storeProduct.extensions?.["nutzen-fields"];
  const priceValue = minorUnitValue(storeProduct.prices.price, storeProduct.prices.currency_minor_unit);
  const remoteImages = storeProduct.images.map((image) => image.src).filter(Boolean);

  return {
    ...visual,
    wooId: storeProduct.id,
    sku: storeProduct.sku,
    name: storeProduct.name || visual.name,
    description: stripHtml(storeProduct.short_description || storeProduct.description) || visual.description,
    priceValue,
    price: formatPrice(priceValue, storeProduct.prices.currency_code),
    images: remoteImages.length > 0 ? remoteImages : visual.images,
    availableForPurchase: storeProduct.is_purchasable && storeProduct.is_in_stock,
    stockStatus: storeProduct.is_in_stock ? "instock" : "outofstock",
    ingredients: fields?.ingredients || visual.ingredients,
    directions: fields?.directions || visual.directions,
    storage: fields?.storage || visual.storage,
    nutrition: fields?.nutrition?.length ? fields.nutrition : visual.nutrition,
    features: fields?.benefits?.length ? fields.benefits : visual.features,
  };
}

export async function getCommerceCatalog(): Promise<CommerceCatalog> {
  if (!isWordPressConfigured()) return { products: fallbackProducts, source: "fallback", fallbackReason: "not-configured" };

  try {
    const storeProducts = await storeApiRequest<StoreApiProduct[]>("products?per_page=100", {
      cache: "no-store",
    });
    const mapped = storeProducts.map(mergeStoreProduct);
    return mapped.length > 0
      ? { products: sortProductsByWeight(mapped), source: "woocommerce" }
      : { products: fallbackProducts, source: "fallback", fallbackReason: "empty-catalog" };
  } catch (error) {
    console.error("[woocommerce] Failed to load product catalog.", error);
    return { products: fallbackProducts, source: "fallback", fallbackReason: "request-failed" };
  }
}

export async function getCommerceProduct(slug: string): Promise<Product | undefined> {
  const fallback = fallbackProducts.find((product) => product.slug === slug);
  if (!isWordPressConfigured()) return fallback;

  try {
    const result = await storeApiRequest<StoreApiProduct[]>(`products?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    return result[0] ? mergeStoreProduct(result[0]) ?? fallback : fallback;
  } catch (error) {
    console.error(`[woocommerce] Failed to load product ${slug}.`, error);
    return fallback;
  }
}
