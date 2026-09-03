/**
 * Helpers de imagem da Unsplash — compartilhados por busca (Fase 2), persistência
 * (Fase 3) e render. Sem `server-only`: rodam no servidor e no client.
 */

/**
 * Base de proporção pro `aspect-ratio` (ex.: `"3 / 4"`) a partir das dimensões da
 * foto. `undefined` quando a dimensão não é conhecida — aí o `ImageTile` cai na
 * proporção padrão. Boards salvos antes de 09/2026 não guardam dimensão.
 */
export function aspectRatioFrom(
  width?: number | null,
  height?: number | null,
): string | undefined {
  if (!width || !height || width <= 0 || height <= 0) return undefined;
  return `${width} / ${height}`;
}

/**
 * Reescreve uma URL de `images.unsplash.com` pra pedir a foto num tamanho maior e
 * com compressão leve — a Unsplash serve o recorte sob demanda (Imgix). Assim o
 * board salvo não fica preso no `urls.regular` (1080px). URLs de outra origem
 * passam intactas.
 */
export function unsplashHiRes(url: string, targetWidth = 2000): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "images.unsplash.com") return url;
    parsed.searchParams.set("w", String(targetWidth));
    // Compressão leve no original — o `next/image` ainda re-otimiza por cima.
    parsed.searchParams.set("q", "85");
    parsed.searchParams.set("fit", "max");
    parsed.searchParams.delete("h");
    return parsed.toString();
  } catch {
    return url;
  }
}
