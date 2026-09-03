import "server-only";
import { createClient } from "@/lib/supabase/server";
import { aspectRatioFrom } from "@/lib/unsplash-image";
import type { Board, BoardSummary, PublicBoard } from "@/types";

/**
 * Leituras de board contra o Supabase (Fase 3). Tudo passa pelo client de
 * servidor — a RLS por `user_id` garante que cada usuário só enxerga os próprios
 * boards; a visão pública (`/b/[slug]`) vai pela função `get_public_board`, nunca
 * por `select` direto nas tabelas.
 */

/** Boards do usuário logado, do mais recente ao mais antigo, com capa e contagem. */
export async function listBoards(): Promise<BoardSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select("id, title, slug, created_at, board_images(thumb_url, description, sort_order)")
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "board_images", ascending: true });

  if (error) throw new Error(`listBoards: ${error.message}`);

  return (data ?? []).map((row) => {
    const images = row.board_images ?? [];
    return {
      id: row.id,
      name: row.title,
      slug: row.slug,
      savedAt: row.created_at,
      itemCount: images.length,
      cover: images.slice(0, 4).map((img) => ({
        thumbUrl: img.thumb_url,
        description: img.description,
      })),
    };
  });
}

/** Um board do usuário logado, com todas as imagens. `null` se não existe/não é dele. */
export async function getBoard(id: string): Promise<Board | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select(
      "id, title, slug, search_term, created_at, board_images(id, unsplash_id, image_url, thumb_url, author, description, width, height, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    // `22P02` = uuid malformado na URL: trata como "não encontrado".
    if (error.code === "22P02") return null;
    throw new Error(`getBoard: ${error.message}`);
  }
  if (!data) return null;

  const items = [...(data.board_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      unsplashId: img.unsplash_id,
      description: img.description,
      author: img.author,
      imageUrl: img.image_url,
      thumbUrl: img.thumb_url,
      width: img.width ?? undefined,
      height: img.height ?? undefined,
      // Proporção real da foto — sem isso o `ImageTile` força 4/5 e distorce.
      aspectRatio: aspectRatioFrom(img.width, img.height),
    }));

  return {
    id: data.id,
    name: data.title,
    slug: data.slug,
    searchTerm: data.search_term,
    savedAt: data.created_at,
    items,
  };
}

/**
 * Board público por slug (`/b/[slug]`) — via a função Postgres `get_public_board`,
 * que roda com `security definer` e só devolve algo com o slug exato. Sem slug
 * certo, `null` — sem vazar se outros slugs existem.
 */
export async function getPublicBoard(slug: string): Promise<PublicBoard | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_board", { board_slug: slug });

  if (error) throw new Error(`getPublicBoard: ${error.message}`);
  if (!data || data.length === 0) return null;

  const rows = [...data].sort((a, b) => a.sort_order - b.sort_order);

  return {
    title: rows[0].title,
    savedAt: rows[0].created_at,
    images: rows.map((row) => ({
      imageUrl: row.image_url,
      thumbUrl: row.thumb_url,
      author: row.author,
      description: row.description,
      aspectRatio: aspectRatioFrom(row.width, row.height),
    })),
  };
}
