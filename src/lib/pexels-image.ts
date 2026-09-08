/**
 * Helpers de imagem da Pexels — equivalente ao `unsplash-image.ts`. Sem
 * `server-only`: rodam no servidor (mapeamento da busca) e no client (render).
 *
 * A proporção (`aspectRatio`) sai de `aspectRatioFrom` em `unsplash-image.ts`,
 * que é agnóstico de fonte — aqui só o que é específico da Pexels.
 */

/**
 * Reescreve uma URL de `images.pexels.com` pra pedir a foto num tamanho maior com
 * compressão leve — a Pexels serve o recorte sob demanda pelos parâmetros de
 * query (`auto=compress&cs=tinysrgb&w=…`). Assim o board salvo não fica preso no
 * `src.large` (~940px). URLs de outra origem passam intactas.
 */
export function pexelsHiRes(url: string, targetWidth = 2000): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "images.pexels.com") return url;
    parsed.searchParams.set("auto", "compress");
    parsed.searchParams.set("cs", "tinysrgb");
    parsed.searchParams.set("w", String(targetWidth));
    // Deixa a altura livre — com `w` fixo o serviço mantém a proporção original.
    parsed.searchParams.delete("h");
    parsed.searchParams.delete("dpr");
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Miniatura da Pexels: parte do `src.original` e pede uma versão pequena e
 * comprimida (para grids densos como o board). Espelha o `urls.small` da Unsplash.
 */
export function pexelsThumb(originalUrl: string, targetWidth = 400): string {
  try {
    const parsed = new URL(originalUrl);
    if (parsed.hostname !== "images.pexels.com") return originalUrl;
    parsed.searchParams.set("auto", "compress");
    parsed.searchParams.set("cs", "tinysrgb");
    parsed.searchParams.set("w", String(targetWidth));
    parsed.searchParams.delete("h");
    parsed.searchParams.delete("dpr");
    return parsed.toString();
  } catch {
    return originalUrl;
  }
}
