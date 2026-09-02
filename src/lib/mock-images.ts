import type { SearchImage } from "@/types";

/**
 * Dataset mockado da Fase 1 — substitui a chamada real à Unsplash.
 *
 * Nenhuma requisição de rede: a busca (`searchMockImages`) filtra este array em memória.
 * Na Fase 2 este arquivo sai e a busca passa a bater na Unsplash API de verdade, montando
 * `SearchImage[]` a partir da resposta.
 *
 * As cores em `placeholder` representam o conteúdo visual de cada foto (não a interface),
 * por isso são hex diretos e não tokens de tema.
 */
const RATIOS = ["3 / 4", "4 / 5", "1 / 1", "4 / 3", "5 / 4"] as const;

interface Seed {
  description: string;
  author: string;
  from: string;
  to: string;
  tags: string[];
}

const SEEDS: Seed[] = [
  {
    description: "Fachada de vidro escuro de um edifício corporativo ao entardecer",
    author: "Camila Duarte",
    from: "#1f2733",
    to: "#3b4658",
    tags: ["corporativo", "segurança", "escuro", "arquitetura", "premium", "vidro"],
  },
  {
    description: "Sala de reunião minimalista com mesa de carvalho e luz difusa",
    author: "Henrique Blanco",
    from: "#d8d2c7",
    to: "#f1ede6",
    tags: ["corporativo", "minimalista", "clean", "escritório", "madeira", "claro"],
  },
  {
    description: "Cofre metálico com reflexo suave em ambiente controlado",
    author: "Lucas Prado",
    from: "#2b2b30",
    to: "#54555c",
    tags: ["segurança", "corporativo", "metal", "escuro", "tecnologia"],
  },
  {
    description: "Parede de concreto aparente com sombra diagonal",
    author: "Sofia Rennó",
    from: "#b9b4ad",
    to: "#8f8a82",
    tags: ["minimalista", "concreto", "arquitetura", "textura", "neutro", "brutalismo"],
  },
  {
    description: "Composição tipográfica preta sobre papel off-white",
    author: "André Salles",
    from: "#f4f1ea",
    to: "#dcd7cc",
    tags: ["tipografia", "editorial", "minimalista", "clean", "papel", "preto e branco"],
  },
  {
    description: "Detalhe de circuito eletrônico iluminado em azul frio",
    author: "Marina Yos",
    from: "#101a2b",
    to: "#1d3b63",
    tags: ["tecnologia", "escuro", "segurança", "dados", "azul", "futurista"],
  },
  {
    description: "Folhagem tropical densa em tons de verde profundo",
    author: "Rafael Origa",
    from: "#16241a",
    to: "#2f5138",
    tags: ["natureza", "verde", "orgânico", "botânico", "escuro", "folhas"],
  },
  {
    description: "Duna de areia clara com curva suave contra o céu",
    author: "Beatriz Lund",
    from: "#e7d8c1",
    to: "#c9ab84",
    tags: ["natureza", "minimalista", "deserto", "bege", "curva", "calmo"],
  },
  {
    description: "Escadaria em espiral branca vista de baixo",
    author: "Tomás Vieira",
    from: "#f2f2f2",
    to: "#cfd2d6",
    tags: ["arquitetura", "minimalista", "branco", "geometria", "clean", "espiral"],
  },
  {
    description: "Névoa sobre montanhas em camadas acinzentadas",
    author: "Helena Marques",
    from: "#c4cace",
    to: "#8a969d",
    tags: ["natureza", "névoa", "montanha", "calmo", "cinza", "paisagem"],
  },
  {
    description: "Textura de tecido de linho cru em close",
    author: "Igor Bastos",
    from: "#e4ddd0",
    to: "#c8bda7",
    tags: ["textura", "tecido", "orgânico", "neutro", "artesanal", "linho"],
  },
  {
    description: "Luz neon roxa refletida em piso molhado à noite",
    author: "Nina Couto",
    from: "#1a1030",
    to: "#4a1f74",
    tags: ["vibrante", "noturno", "neon", "roxo", "urbano", "escuro"],
  },
  {
    description: "Prédio corporativo espelhado refletindo nuvens",
    author: "Camila Duarte",
    from: "#aeb9c4",
    to: "#7e8b99",
    tags: ["corporativo", "arquitetura", "vidro", "céu", "premium", "reflexo"],
  },
  {
    description: "Mesa de trabalho branca com laptop e caderno fechado",
    author: "Pedro Antunes",
    from: "#f0efeb",
    to: "#d6d4cc",
    tags: ["minimalista", "clean", "escritório", "produtividade", "branco", "workspace"],
  },
  {
    description: "Onda do mar congelada em tons de azul petróleo",
    author: "Luiza Fontes",
    from: "#0c2230",
    to: "#1c4a5a",
    tags: ["natureza", "mar", "azul", "movimento", "escuro", "água"],
  },
  {
    description: "Pôr do sol alaranjado sobre horizonte urbano",
    author: "Gabriel Nery",
    from: "#f0a35e",
    to: "#c65a3c",
    tags: ["vibrante", "urbano", "laranja", "calor", "cidade", "entardecer"],
  },
  {
    description: "Padrão geométrico de sombras em fachada modernista",
    author: "Sofia Rennó",
    from: "#d0c9bd",
    to: "#9c9385",
    tags: ["arquitetura", "geometria", "sombra", "modernista", "neutro", "padrão"],
  },
  {
    description: "Retrato em contraluz com fundo preto total",
    author: "Marcos Leal",
    from: "#0a0a0a",
    to: "#2a2a2a",
    tags: ["retrato", "escuro", "dramático", "contraste", "preto", "pessoas"],
  },
  {
    description: "Pilha de livros antigos com capas em tons terrosos",
    author: "Helena Marques",
    from: "#6b4a2f",
    to: "#a9855c",
    tags: ["editorial", "vintage", "marrom", "livros", "aconchegante", "terroso"],
  },
  {
    description: "Superfície de mármore branco com veios cinza",
    author: "Igor Bastos",
    from: "#f4f4f2",
    to: "#d9d5d0",
    tags: ["textura", "mármore", "premium", "branco", "clean", "luxo"],
  },
  {
    description: "Campo de trigo dourado balançando ao vento",
    author: "Rafael Origa",
    from: "#e8c874",
    to: "#b98f3e",
    tags: ["natureza", "dourado", "campo", "calmo", "rural", "luz quente"],
  },
  {
    description: "Interior industrial com tubulação exposta e concreto",
    author: "Tomás Vieira",
    from: "#3a3a3d",
    to: "#63636a",
    tags: ["industrial", "loft", "concreto", "urbano", "cru", "escuro"],
  },
  {
    description: "Flores secas em vaso de cerâmica sobre fundo neutro",
    author: "Nina Couto",
    from: "#ded4c6",
    to: "#b7a48c",
    tags: ["botânico", "minimalista", "seco", "neutro", "delicado", "still life"],
  },
  {
    description: "Linhas de luz longa exposição em túnel escuro",
    author: "Marina Yos",
    from: "#0d0d14",
    to: "#2b2140",
    tags: ["vibrante", "movimento", "noturno", "luz", "escuro", "abstrato"],
  },
  {
    description: "Praia de pedras cinzas sob céu nublado",
    author: "Luiza Fontes",
    from: "#b6babc",
    to: "#84898c",
    tags: ["natureza", "minimalista", "cinza", "praia", "calmo", "nublado"],
  },
  {
    description: "Grade metálica dourada em detalhe arquitetônico art déco",
    author: "Gabriel Nery",
    from: "#8a6a2f",
    to: "#c9a24a",
    tags: ["arquitetura", "art déco", "dourado", "detalhe", "premium", "metal"],
  },
  {
    description: "Papel amassado branco formando textura de vinco",
    author: "André Salles",
    from: "#f6f6f4",
    to: "#d5d5d0",
    tags: ["textura", "papel", "branco", "minimalista", "clean", "abstrato"],
  },
  {
    description: "Céu estrelado profundo sobre silhueta de floresta",
    author: "Marcos Leal",
    from: "#070b18",
    to: "#1b2540",
    tags: ["natureza", "escuro", "noturno", "estrelas", "azul", "vasto"],
  },
];

export const MOCK_IMAGES: SearchImage[] = SEEDS.map((seed, index) => ({
  id: `mock-${String(index + 1).padStart(2, "0")}`,
  description: seed.description,
  author: seed.author,
  aspectRatio: RATIOS[index % RATIOS.length],
  placeholder: { from: seed.from, to: seed.to },
  tags: seed.tags,
}));

/**
 * Busca mockada da Fase 1: filtra `MOCK_IMAGES` por qualquer termo digitado
 * (casa em descrição + tags). Query vazia devolve lista vazia — o estado inicial
 * da tela é um convite a buscar, não um grid pré-populado.
 */
export function searchMockImages(query: string): SearchImage[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);
  return MOCK_IMAGES.filter((image) => {
    const haystack = [image.description, ...image.tags].join(" ").toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}
