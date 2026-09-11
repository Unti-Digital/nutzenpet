import type { StaticImageData } from "next/image";
import blogExercise from "../../nutzenpet-assets-individuais/blog-exercicios-cachorro.png";
import blogCat from "../../nutzenpet-assets-individuais/blog-gato-cuidados.png";
import blogFood from "../../nutzenpet-assets-individuais/blog-racao-cachorro.png";

export type Post = {
  slug: string;
  tag: string;
  title: string;
  description: string;
  image: StaticImageData;
  date: string;
  readingTime: string;
  content: Array<{ heading: string; paragraphs: string[] }>;
};

export const posts: Post[] = [
  {
    slug: "como-escolher-racao-ideal-para-seu-cao",
    tag: "Nutrição",
    title: "Como escolher a ração ideal para o seu cão",
    description: "Saiba como identificar as melhores opções para cada fase da vida.",
    image: blogFood,
    date: "08 de setembro de 2026",
    readingTime: "5 min de leitura",
    content: [
      { heading: "Cada fase pede um cuidado", paragraphs: ["Filhotes, adultos e cães idosos têm necessidades diferentes de energia, proteínas, vitaminas e minerais. Por isso, o primeiro passo é escolher um alimento desenvolvido para a idade e o porte do seu pet.", "A rotina também importa. Animais muito ativos podem precisar de mais energia, enquanto cães com tendência ao ganho de peso se beneficiam de porções cuidadosamente ajustadas."] },
      { heading: "Observe os ingredientes", paragraphs: ["Procure fórmulas completas, com fontes de proteína identificadas e nutrientes que favoreçam digestão, pele e pelagem. A composição deve ser clara e adequada à recomendação do médico-veterinário."] },
      { heading: "Faça uma transição gradual", paragraphs: ["Ao trocar o alimento, misture a nova ração à anterior durante cerca de sete dias. A mudança progressiva ajuda o sistema digestivo e permite observar como o pet responde à nova alimentação."] },
    ],
  },
  {
    slug: "cinco-dicas-gato-saudavel-feliz",
    tag: "Bem-estar",
    title: "5 dicas para manter seu gato saudável e feliz",
    description: "Pequenos cuidados que fazem diferença no dia a dia do seu felino.",
    image: blogCat,
    date: "03 de setembro de 2026",
    readingTime: "4 min de leitura",
    content: [
      { heading: "Uma rotina que respeita o jeito felino", paragraphs: ["Gatos valorizam previsibilidade, locais seguros e recursos bem distribuídos pela casa. Comedouro, água e caixa de areia devem ficar em pontos tranquilos e separados."] },
      { heading: "Hidratação e alimentação", paragraphs: ["Disponibilize água fresca em mais de um ponto e mantenha os recipientes limpos. Sirva um alimento completo na quantidade adequada ao peso, à idade e ao nível de atividade."] },
      { heading: "Brincadeira também é cuidado", paragraphs: ["Sessões curtas de brincadeira estimulam comportamentos naturais, ajudam no controle de peso e fortalecem o vínculo. Varinhas, bolinhas e brinquedos com desafio tornam a rotina mais interessante."] },
    ],
  },
  {
    slug: "exercicios-fortalecem-vinculo-com-pet",
    tag: "Comportamento",
    title: "Exercícios que fortalecem o vínculo com seu pet",
    description: "Atividades simples para uma rotina mais ativa e saudável.",
    image: blogExercise,
    date: "28 de agosto de 2026",
    readingTime: "6 min de leitura",
    content: [
      { heading: "Movimento com propósito", paragraphs: ["A atividade física ajuda a gastar energia, estimula a mente e cria momentos positivos entre tutor e pet. O melhor exercício é aquele adequado à idade, ao porte e à condição física do animal."] },
      { heading: "Comece aos poucos", paragraphs: ["Caminhadas, circuitos simples em casa e jogos de busca podem ser adaptados à rotina. Aumente duração e intensidade gradualmente, observando sinais de cansaço."] },
      { heading: "Consistência vale mais", paragraphs: ["Poucos minutos todos os dias costumam trazer mais benefícios do que uma atividade intensa e esporádica. Encerre cada sessão de maneira tranquila e positiva."] },
    ],
  },
  {
    slug: "porcao-certa-alimentacao-diaria",
    tag: "Nutrição",
    title: "Porção certa: equilíbrio em cada refeição",
    description: "Entenda como peso, idade e rotina influenciam a quantidade diária.",
    image: blogFood,
    date: "20 de agosto de 2026",
    readingTime: "4 min de leitura",
    content: [
      { heading: "A recomendação é um ponto de partida", paragraphs: ["A tabela da embalagem orienta a porção diária, mas condição corporal e nível de atividade também devem ser considerados. Divida o total ao longo do dia e evite completar o pote sem medir."] },
      { heading: "Acompanhe o corpo do pet", paragraphs: ["Mudanças de peso, apetite ou disposição merecem atenção. Reavalie a porção periodicamente e conte com orientação veterinária para ajustes individuais."] },
    ],
  },
  {
    slug: "enriquecimento-ambiental-para-gatos",
    tag: "Bem-estar",
    title: "Enriquecimento ambiental para gatos",
    description: "Transforme a casa em um espaço mais estimulante e acolhedor.",
    image: blogCat,
    date: "14 de agosto de 2026",
    readingTime: "5 min de leitura",
    content: [
      { heading: "Explore o espaço vertical", paragraphs: ["Prateleiras, nichos e arranhadores altos ampliam o território do gato e oferecem pontos seguros para descanso e observação."] },
      { heading: "Novidade na medida certa", paragraphs: ["Alterne brinquedos, ofereça caixas e crie pequenas oportunidades de caça ao alimento. Apresente novidades sem retirar os esconderijos e recursos que já trazem segurança."] },
    ],
  },
  {
    slug: "passeio-seguro-divertido",
    tag: "Comportamento",
    title: "Como tornar o passeio mais seguro e divertido",
    description: "Organização e leitura do ambiente deixam a caminhada mais leve.",
    image: blogExercise,
    date: "05 de agosto de 2026",
    readingTime: "5 min de leitura",
    content: [
      { heading: "Prepare antes de sair", paragraphs: ["Use guia e peitoral adequados, leve água em dias quentes e escolha horários com temperatura amena. Identificação atualizada é indispensável."] },
      { heading: "Deixe o pet explorar", paragraphs: ["Cheirar faz parte do passeio e oferece estímulo mental. Combine momentos de exploração com uma caminhada confortável, respeitando o ritmo e os limites do animal."] },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
