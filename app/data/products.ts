import largeDogBanner from "../../fotos-extras/rottweiler.png";
import smallDogBanner from "../../fotos-sobre/cahorro.jpg";
import catBanner from "../../fotos-sobre/Gato-02.webp";

export type ProductSpecies = "dog" | "cat";
export type ProductLine = "medium-large-dogs" | "small-dogs" | "neutered-cats" | "other";

export type ProductBanner = {
  eyebrow: string;
  title: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
};

export type ProductSizeOption = {
  label: string;
  slug: string;
};

export type Product = {
  wooId?: number;
  sku?: string;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  slug: string;
  line: ProductLine;
  species: ProductSpecies;
  shortName: string;
  name: string;
  description: string;
  weight: string;
  price: string;
  priceValue: number;
  availableForPurchase: boolean;
  featured: boolean;
  sizeOptions: ProductSizeOption[];
  accent: string;
  soft: string;
  images: string[];
  features: string[];
  nutrition: Array<{ label: string; value: string }>;
  ingredients: string;
  directions: string;
  storage: string;
  feedingGuide: Array<{ weight: string; amount: string }>;
  banner?: Partial<ProductBanner>;
};

const bannerDefaults: Record<ProductSpecies, ProductBanner> = {
  dog: {
    eyebrow: "Nutrição para cães",
    title: "Cuidado completo em todas as fases.",
    image: smallDogBanner.src,
    imageAlt: "Cachorro saudável representando a linha de alimentos para cães",
    imagePosition: "center",
  },
  cat: {
    eyebrow: "Nutrição para gatos",
    title: "Equilíbrio pensado para os felinos.",
    image: catBanner.src,
    imageAlt: "Gato saudável representando a linha de alimentos para gatos",
    imagePosition: "center",
  },
};

const mediumLargeSizes: ProductSizeOption[] = [
  { label: "1 kg", slug: "racas-medias-grandes-1kg" },
  { label: "3 kg", slug: "racas-medias-grandes-3kg" },
  { label: "15 kg", slug: "racas-medias-grandes-15kg" },
];

const smallDogSizes: ProductSizeOption[] = [
  { label: "1 kg", slug: "racas-pequenas-1kg" },
  { label: "3 kg", slug: "racas-pequenas-3kg" },
  { label: "10 kg", slug: "racas-pequenas-10kg" },
];

const catSizes: ProductSizeOption[] = [
  { label: "1 kg", slug: "gatos-castrados-1kg" },
  { label: "3 kg", slug: "gatos-castrados-3kg" },
  { label: "10,1 kg", slug: "gatos-castrados-10-1kg" },
];

const mediumLargeBase = {
  line: "medium-large-dogs" as const,
  species: "dog" as const,
  shortName: "Médias e grandes",
  name: "Cães Adultos Raças Médias e Grandes",
  description: "Alimento completo com frango e batata-doce, desenvolvido para a energia e o cuidado diário de cães adultos.",
  sizeOptions: mediumLargeSizes,
  accent: "#3E1255",
  soft: "#F5EEF8",
  images: [
    "/produtos/produto1-1.png?v=2",
    "/produtos/produto1-2.png?v=2",
    "/produtos/produto1-3.png?v=2",
  ],
  banner: {
    eyebrow: "Força, energia e cuidado diário",
    title: "Nutrição à altura dos cães médios e grandes.",
    image: largeDogBanner.src,
    imageAlt: "Cão de grande porte saudável",
    imagePosition: "center 38%",
  },
  features: ["23% de proteína", "Ômegas 3 e 6 + DHA", "Condroitina e glicosamina"],
  nutrition: [
    { label: "Umidade", value: "10% máx." },
    { label: "Proteína bruta", value: "23% mín." },
    { label: "Extrato etéreo", value: "10% mín." },
    { label: "Matéria fibrosa", value: "3% máx." },
    { label: "Matéria mineral", value: "8% máx." },
    { label: "Cálcio", value: "0,8% mín. / 2% máx." },
    { label: "Fósforo", value: "0,8% mín." },
    { label: "Ácido linoleico", value: "2% mín." },
    { label: "Ácido linolênico", value: "0,15% mín." },
    { label: "Energia metabolizável", value: "3.750 kcal/kg" },
  ],
  ingredients: "Fórmula com frango, batata-doce, cereais ancestrais, proteínas selecionadas, ômegas 3 e 6, DHA e nutrientes funcionais.",
  directions: "Ofereça o alimento seco. As quantidades abaixo indicam, respectivamente, a recomendação para atividade moderada e alta. Faça a troca de alimentação gradualmente e mantenha água fresca sempre disponível.",
  storage: "Conserve a embalagem bem fechada, em local seco, fresco e protegido da luz solar. Após aberta, mantenha afastada de produtos com odor forte.",
  feedingGuide: [
    { weight: "1 kg", amount: "50 g / 90 g" },
    { weight: "5 kg", amount: "150 g / 180 g" },
    { weight: "10 kg", amount: "210 g / 230 g" },
    { weight: "20 kg", amount: "320 g / 410 g" },
    { weight: "30 kg", amount: "415 g / 540 g" },
    { weight: "40 kg", amount: "510 g / 670 g" },
    { weight: "50 kg", amount: "600 g / 780 g" },
    { weight: "60 kg ou mais", amount: "690 g / 890 g" },
  ],
};

const smallDogBase = {
  line: "small-dogs" as const,
  species: "dog" as const,
  shortName: "Raças pequenas",
  name: "Cães Adultos Raças Pequenas",
  description: "Nutrição completa com frango e batata-doce em grãos adequados para cães de pequeno porte.",
  sizeOptions: smallDogSizes,
  accent: "#3E1255",
  soft: "#EAF3F3",
  images: [
    "/produtos/produto2-1.png?v=2",
    "/produtos/produto2-2.png?v=2",
    "/produtos/produto2-3.png?v=2",
  ],
  banner: {
    eyebrow: "Cuidado na medida certa",
    title: "Pequenos no tamanho. Grandes em personalidade.",
    image: smallDogBanner.src,
    imageAlt: "Cachorro de pequeno porte saudável",
    imagePosition: "center 38%",
  },
  features: ["25% de proteína", "Ômegas 3 e 6 + DHA", "Condroitina e glicosamina"],
  nutrition: [
    { label: "Umidade", value: "10% máx." },
    { label: "Proteína bruta", value: "25% mín." },
    { label: "Extrato etéreo", value: "10% mín." },
    { label: "Matéria fibrosa", value: "3% máx." },
    { label: "Matéria mineral", value: "8% máx." },
    { label: "Cálcio", value: "0,8% mín. / 2% máx." },
    { label: "Fósforo", value: "0,8% mín." },
    { label: "Ácido linoleico", value: "2% mín." },
    { label: "Ácido linolênico", value: "0,15% mín." },
    { label: "Energia metabolizável", value: "3.800 kcal/kg" },
  ],
  ingredients: "Fórmula com frango, batata-doce, cereais ancestrais, proteínas selecionadas, ômegas 3 e 6, DHA e nutrientes funcionais.",
  directions: "Sirva o alimento seco. As quantidades abaixo indicam, respectivamente, a recomendação para atividade moderada e alta. Adapte a porção à condição corporal do pet.",
  storage: "Armazene em ambiente limpo, seco e arejado, mantendo a embalagem fechada e protegida do calor, da umidade e da incidência direta de sol.",
  feedingGuide: [
    { weight: "2 kg", amount: "55 g / 75 g" },
    { weight: "4 kg", amount: "85 g / 105 g" },
    { weight: "6 kg", amount: "105 g / 135 g" },
    { weight: "8 kg", amount: "145 g / 175 g" },
    { weight: "10 kg", amount: "185 g / 215 g" },
    { weight: "12 kg", amount: "225 g / 245 g" },
    { weight: "15 kg", amount: "255 g / 265 g" },
  ],
};

const catBase = {
  line: "neutered-cats" as const,
  species: "cat" as const,
  shortName: "Gatos castrados",
  name: "Gatos Adultos Castrados",
  description: "Fórmula completa com salmão, frango e batata-doce para o cuidado diário de gatos adultos castrados.",
  sizeOptions: catSizes,
  accent: "#CC632B",
  soft: "#FFF0E9",
  images: [
    "/produtos/produto3-1.png?v=2",
    "/produtos/produto3-2.png?v=2",
    "/produtos/produto3-3.png?v=2",
  ],
  banner: {
    eyebrow: "Bem-estar depois da castração",
    title: "Equilíbrio especial para gatos castrados.",
    image: catBanner.src,
    imageAlt: "Gato adulto saudável",
    imagePosition: "center 35%",
  },
  features: ["32% de proteína", "Redução de bolas de pelo", "Saúde intestinal e urinária"],
  nutrition: [
    { label: "Umidade", value: "10% máx." },
    { label: "Proteína bruta", value: "32% mín." },
    { label: "Extrato etéreo", value: "10% mín." },
    { label: "Matéria fibrosa", value: "4% máx." },
    { label: "Matéria mineral", value: "8% máx." },
    { label: "Cálcio", value: "0,8% mín. / 1,8% máx." },
    { label: "Fósforo", value: "0,7% mín." },
    { label: "Taurina", value: "0,1% mín." },
    { label: "Extrato de yucca", value: "0,015% mín." },
    { label: "Energia metabolizável", value: "3.700 kcal/kg" },
    { label: "pH urinário", value: "6,2 a 6,8" },
  ],
  ingredients: "Fórmula com salmão, frango, batata-doce, cereais ancestrais, proteínas selecionadas, taurina, extrato de yucca e nutrientes funcionais.",
  directions: "Divida a recomendação diária em pequenas refeições. Ajuste a quantidade conforme peso, idade e condição corporal do gato, mantendo água limpa sempre disponível.",
  storage: "Mantenha em local fresco, seco e sem luz direta. Feche completamente a embalagem após cada uso e não armazene junto a produtos de limpeza.",
  feedingGuide: [
    { weight: "1 a 2 kg", amount: "30 a 40 g" },
    { weight: "3 a 4 kg", amount: "50 a 60 g" },
    { weight: "5 a 6 kg", amount: "70 a 80 g" },
    { weight: "7 a 8 kg", amount: "90 a 110 g" },
    { weight: "9 a 10 kg", amount: "120 a 130 g" },
  ],
};

export const products: Product[] = [
  { ...mediumLargeBase, slug: "racas-medias-grandes-1kg", weight: "1 kg", price: "R$ 29,90", priceValue: 29.9, availableForPurchase: true, featured: false, images: ["/produtos/racas-medias-grandes-1kg.png"] },
  { ...mediumLargeBase, slug: "racas-medias-grandes-3kg", weight: "3 kg", price: "R$ 69,90", priceValue: 69.9, availableForPurchase: true, featured: false, images: ["/produtos/racas-medias-grandes-3kg.png"] },
  { ...mediumLargeBase, slug: "racas-medias-grandes-15kg", weight: "15 kg", price: "R$ 149,90", priceValue: 149.9, availableForPurchase: true, featured: true },
  { ...smallDogBase, slug: "racas-pequenas-1kg", weight: "1 kg", price: "R$ 29,90", priceValue: 29.9, availableForPurchase: true, featured: false, images: ["/produtos/racas-pequenas-1kg.png"] },
  { ...smallDogBase, slug: "racas-pequenas-3kg", weight: "3 kg", price: "R$ 69,90", priceValue: 69.9, availableForPurchase: true, featured: false, images: ["/produtos/racas-pequenas-3kg.png"] },
  { ...smallDogBase, slug: "racas-pequenas-10kg", weight: "10 kg", price: "R$ 129,90", priceValue: 129.9, availableForPurchase: true, featured: true },
  { ...catBase, slug: "gatos-castrados-1kg", weight: "1 kg", price: "R$ 34,90", priceValue: 34.9, availableForPurchase: true, featured: false, images: ["/produtos/gatos-castrados-1kg.png"] },
  { ...catBase, slug: "gatos-castrados-3kg", weight: "3 kg", price: "R$ 79,90", priceValue: 79.9, availableForPurchase: true, featured: false, images: ["/produtos/gatos-castrados-3kg.png"] },
  { ...catBase, slug: "gatos-castrados-10-1kg", weight: "10,1 kg", price: "R$ 139,90", priceValue: 139.9, availableForPurchase: true, featured: true },
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProductsByLine(line: ProductLine) {
  return products.filter((product) => product.line === line);
}

export function getProductBanner(product: Product): ProductBanner {
  return {
    ...bannerDefaults[product.species],
    title: product.name,
    ...product.banner,
  };
}

export function getProduct(slug: string) {
  const legacySlugs: Record<string, string> = {
    "racas-medias-grandes": "racas-medias-grandes-15kg",
    "racas-pequenas": "racas-pequenas-10kg",
    "gatos-castrados": "gatos-castrados-10-1kg",
  };

  const currentSlug = legacySlugs[slug] ?? slug;
  return products.find((product) => product.slug === currentSlug);
}
