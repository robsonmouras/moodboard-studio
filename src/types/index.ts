/**
 * Tipos de domínio do produto — já tipados na Fase 1 (protótipo com dados mockados)
 * para evitar refatoração na Fase 2, quando os dados reais da Unsplash entram no lugar
 * dos mocks. Nada de `any` solto.
 */

/**
 * Uma imagem de resultado de busca.
 *
 * Na Fase 1 os campos são preenchidos por `src/lib/mock-images.ts`. Na Fase 2 a mesma
 * forma passa a ser montada a partir da resposta real da Unsplash (`urls.regular`,
 * `user.name`, `alt_description` etc.) — por isso os nomes já seguem esse vocabulário.
 */
export interface SearchImage {
  /** Identificador estável do resultado (na Fase 2, o `id` da Unsplash). */
  id: string;
  /** Texto curto que descreve a imagem — usado em `alt` e na busca. */
  description: string;
  /** Crédito do autor (exigência da licença da Unsplash a partir da Fase 2). */
  author: string;
  /** Proporção do placeholder, no formato aceito por `aspect-ratio` (ex.: "3 / 4"). */
  aspectRatio: string;
  /**
   * Par de cores do placeholder mockado (gradiente). Representa o conteúdo da foto,
   * não o chrome da interface — por isso não sai de token de tema.
   * Some na Fase 2, quando entra a URL real da imagem.
   */
  placeholder: { from: string; to: string };
  /** Palavras-chave para o filtro de busca mockado. Some na Fase 2. */
  tags: string[];
}

/** Um item já favoritado e presente no board. */
export type BoardItem = SearchImage;

/**
 * Um board salvo — favoritos agrupados sob um nome.
 *
 * Fase 1: os boards vêm de `src/lib/mock-boards.ts` e as edições (renomear, excluir,
 * remover imagem) vivem só em memória no `BoardsProvider`. Na Fase 3 isto vira uma
 * tabela no Supabase (`id` = PK, `savedAt` = coluna, `items` = relação).
 */
export interface Board {
  /** Identificador estável — usado na rota `/favoritos/[id]`. */
  id: string;
  /** Nome que o usuário deu ao board. */
  name: string;
  /** Quando o board foi salvo (ISO 8601). */
  savedAt: string;
  /** As inspirações guardadas no board. */
  items: BoardItem[];
}
