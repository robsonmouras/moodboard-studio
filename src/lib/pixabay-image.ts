/**
 * Helpers de imagem da Pixabay — equivalente a `unsplash-image.ts` / `pexels-image.ts`.
 * Sem `server-only`: rodam no servidor (mapeamento da busca) e no client (render).
 *
 * A Pixabay não redimensiona por query string como a Unsplash/Pexels — o tamanho
 * vem do sufixo no nome do arquivo. `webformatURL` (`_640`) aceita as variantes
 * `_180`, `_340` e `_960`; `largeImageURL` entrega 1280 px. Acima disso (`fullHDURL`,
 * `imageURL`) só com conta confirmada — então 1280 px é o teto pra exibir e pra
 * salvar no board (mais baixo que Unsplash/Pexels, mas é o que a licença libera).
 */

/** Sufixo de tamanho no fim do `webformatURL` (`.../flor_640.jpg`). */
const WEBFORMAT_640 = /_640(?=\.[a-z0-9]+$)/i;

/**
 * Miniatura pra grids densos: pede o `webformatURL` de 640 px na variante de
 * 340 px. Se o padrão não bater (URL fora do formato esperado), devolve a
 * original intacta — espelha o `urls.small` da Unsplash / `pexelsThumb`.
 */
export function pixabayThumb(webformatUrl: string): string {
  return webformatUrl.replace(WEBFORMAT_640, "_340");
}
