export type Product = {
  slug: string;
  shortName: string;
  name: string;
  description: string;
  weight: string;
  price: string;
  priceValue: number;
  accent: string;
  soft: string;
  images: [string, string, string];
  features: string[];
  nutrition: Array<{ label: string; value: string }>;
  ingredients: string;
  directions: string;
  storage: string;
  feedingGuide: Array<{ weight: string; amount: string }>;
};

export const products: Product[] = [
  {
    slug: "racas-medias-grandes",
    shortName: "Médias e grandes",
    name: "Cães Adultos Raças Médias e Grandes",
    description:
      "Alimento completo com carne e vegetais, desenvolvido para a energia e o cuidado diário de cães adultos.",
    weight: "15 kg",
    price: "R$ 149,90",
    priceValue: 149.9,
    accent: "#3E1255",
    soft: "#F5EEF8",
    images: [
      "/produtos/produto1-1.png",
      "/produtos/produto1-2.png",
      "/produtos/produto1-3.png",
    ],
    features: ["Proteínas selecionadas", "Vitaminas e minerais", "Alta palatabilidade"],
    nutrition: [
      { label: "Proteína bruta", value: "23% mín." },
      { label: "Extrato etéreo", value: "12% mín." },
      { label: "Matéria fibrosa", value: "4% máx." },
      { label: "Matéria mineral", value: "8% máx." },
      { label: "Umidade", value: "12% máx." },
      { label: "Cálcio", value: "0,8% - 1,6%" },
    ],
    ingredients:
      "Farinha de vísceras de aves, arroz quebrado, milho integral moído, farelo de soja, gordura de aves, polpa de beterraba, levedura seca, vitaminas e minerais.",
    directions:
      "Ofereça o alimento seco, dividido em duas porções diárias. Faça a troca de alimentação gradualmente durante sete dias e mantenha água fresca sempre disponível.",
    storage:
      "Conserve a embalagem bem fechada, em local seco, fresco e protegido da luz solar. Após aberta, mantenha afastada de produtos com odor forte.",
    feedingGuide: [
      { weight: "10 a 15 kg", amount: "165 a 225 g" },
      { weight: "16 a 25 kg", amount: "235 a 320 g" },
      { weight: "26 a 40 kg", amount: "330 a 440 g" },
      { weight: "Acima de 40 kg", amount: "450 g +" },
    ],
  },
  {
    slug: "racas-pequenas",
    shortName: "Raças pequenas",
    name: "Cães Adultos Raças Pequenas",
    description:
      "Nutrição equilibrada em grãos adequados para cães de pequeno porte, com sabor e digestibilidade.",
    weight: "10,1 kg",
    price: "R$ 129,90",
    priceValue: 129.9,
    accent: "#124D55",
    soft: "#EAF3F3",
    images: [
      "/produtos/produto2-1.png",
      "/produtos/produto2-2.png",
      "/produtos/produto2-3.png",
    ],
    features: ["Grãos de tamanho ideal", "Digestão equilibrada", "Pele e pelagem saudáveis"],
    nutrition: [
      { label: "Proteína bruta", value: "24% mín." },
      { label: "Extrato etéreo", value: "12% mín." },
      { label: "Matéria fibrosa", value: "4% máx." },
      { label: "Matéria mineral", value: "8% máx." },
      { label: "Umidade", value: "12% máx." },
      { label: "Ômega 6", value: "2% mín." },
    ],
    ingredients:
      "Farinha de vísceras de aves, arroz quebrado, milho integral moído, farinha de carne e ossos, gordura de aves, óleo de peixe, vitaminas e minerais.",
    directions:
      "Sirva a quantidade diária recomendada em duas ou três refeições. Adapte a porção ao nível de atividade do pet e realize mudanças de dieta de forma gradual.",
    storage:
      "Armazene em ambiente limpo, seco e arejado, mantendo a embalagem fechada e protegida do calor, da umidade e da incidência direta de sol.",
    feedingGuide: [
      { weight: "2 a 4 kg", amount: "45 a 75 g" },
      { weight: "5 a 7 kg", amount: "85 a 115 g" },
      { weight: "8 a 10 kg", amount: "125 a 150 g" },
      { weight: "11 a 15 kg", amount: "160 a 205 g" },
    ],
  },
  {
    slug: "gatos-castrados",
    shortName: "Gatos castrados",
    name: "Gatos Adultos Castrados",
    description:
      "Fórmula completa para o cuidado diário de gatos castrados, com equilíbrio de energia e nutrientes essenciais.",
    weight: "10,1 kg",
    price: "R$ 139,90",
    priceValue: 139.9,
    accent: "#CC632B",
    soft: "#FFF0E9",
    images: [
      "/produtos/produto3-1.png",
      "/produtos/produto3-2.png",
      "/produtos/produto3-3.png",
    ],
    features: ["Controle de peso", "Saúde do trato urinário", "Taurina e antioxidantes"],
    nutrition: [
      { label: "Proteína bruta", value: "32% mín." },
      { label: "Extrato etéreo", value: "12% mín." },
      { label: "Matéria fibrosa", value: "4% máx." },
      { label: "Matéria mineral", value: "8,5% máx." },
      { label: "Umidade", value: "10% máx." },
      { label: "Taurina", value: "0,1% mín." },
    ],
    ingredients:
      "Farinha de vísceras de aves, quirera de arroz, glúten de milho, farelo de soja, gordura de aves, fibra de ervilha, óleo de peixe, taurina, vitaminas e minerais.",
    directions:
      "Divida a recomendação diária em pequenas refeições. Ajuste a quantidade conforme peso, idade e condição corporal do gato, mantendo água limpa sempre disponível.",
    storage:
      "Mantenha em local fresco, seco e sem luz direta. Feche completamente a embalagem após cada uso e não armazene junto a produtos de limpeza.",
    feedingGuide: [
      { weight: "2 a 3 kg", amount: "35 a 45 g" },
      { weight: "4 a 5 kg", amount: "50 a 65 g" },
      { weight: "6 a 7 kg", amount: "70 a 80 g" },
      { weight: "8 kg ou mais", amount: "85 g +" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
