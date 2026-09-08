import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

/**
 * Route Handler que grava um board (Fase 3).
 *
 * O client (`SearchWorkspace` → "Salvar") faz `POST /api/boards` com o nome do
 * board, o termo buscado e os itens favoritados. Aqui: valida a sessão, gera o
 * slug público, cria a linha em `boards` e uma linha em `board_images` por item.
 * A RLS por `user_id` faz o resto — nada é gravado sem sessão.
 *
 * Se o corpo trouxer `boardId`, o fluxo é outro: em vez de criar um board novo,
 * as imagens são anexadas a um board que já existe (checagem de nome no client —
 * "já existe um board chamado X, adicionar a ele?"). A RLS garante que só dá pra
 * anexar num board do próprio usuário.
 */

const SLUG_LEN = 10;
const SLUG_RETRIES = 5;

interface IncomingItem {
  unsplashId: string;
  imageUrl: string;
  thumbUrl: string;
  author: string;
  description: string;
  /** Dimensões da foto — pra reconstruir a proporção no board salvo. Opcional. */
  width?: number;
  height?: number;
}

interface IncomingBody {
  title?: string;
  searchTerm?: string | null;
  items?: IncomingItem[];
  /** Quando presente, anexa os itens a este board em vez de criar um novo. */
  boardId?: string;
}

function isItem(value: unknown): value is IncomingItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.unsplashId === "string" &&
    typeof v.imageUrl === "string" &&
    typeof v.thumbUrl === "string" &&
    typeof v.author === "string" &&
    typeof v.description === "string"
  );
}

/** Dimensão da foto: inteiro positivo ou `null` (boards podem vir sem — ver Fase 3). */
function toDimension(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items.filter(isItem) : [];
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "empty_board" }, { status: 400 });
  }

  const searchTerm = body.searchTerm?.trim() || null;
  const title = body.title?.trim() || "";

  // --- Anexar a um board existente (fluxo "adicionar ao board 'X'") ---------
  const targetId = typeof body.boardId === "string" ? body.boardId.trim() : "";
  if (targetId) {
    // Confere que o board é do usuário (a RLS já filtra por `user_id`; um id de
    // outra pessoa ou inexistente volta vazio) e pega a próxima posição livre.
    const { data: target, error: targetError } = await supabase
      .from("boards")
      .select("slug, board_images(sort_order, unsplash_id)")
      .eq("id", targetId)
      .maybeSingle();

    if (targetError) {
      if (targetError.code === "22P02") {
        return NextResponse.json({ ok: false, error: "board_not_found" }, { status: 404 });
      }
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
    }
    if (!target) {
      return NextResponse.json({ ok: false, error: "board_not_found" }, { status: 404 });
    }

    // Nunca a mesma foto duas vezes no board: descarta o que já está lá (o client
    // trava isso na UI, mas outra aba / merge por nome também caem aqui).
    const existingUnsplashIds = new Set(
      (target.board_images ?? []).map((img) => img.unsplash_id),
    );
    // Também dedupa o próprio lote, caso venha repetido.
    const seenInBatch = new Set<string>();
    // Unsplash ids que o client mandou mas já estavam no board — devolvidos pra
    // ele mostrar exatamente QUAIS imagens foram ignoradas.
    const skipped: string[] = [];
    const freshItems = items.filter((item) => {
      if (existingUnsplashIds.has(item.unsplashId)) {
        skipped.push(item.unsplashId);
        return false;
      }
      if (seenInBatch.has(item.unsplashId)) return false;
      seenInBatch.add(item.unsplashId);
      return true;
    });

    if (freshItems.length === 0) {
      return NextResponse.json({
        ok: true,
        slug: target.slug,
        merged: true,
        added: 0,
        skipped,
      });
    }

    const nextSort =
      (target.board_images ?? []).reduce((max, img) => Math.max(max, img.sort_order), -1) + 1;

    const { error: appendError } = await supabase.from("board_images").insert(
      freshItems.map((item, index) => ({
        board_id: targetId,
        unsplash_id: item.unsplashId,
        image_url: item.imageUrl,
        thumb_url: item.thumbUrl,
        author: item.author,
        description: item.description,
        width: toDimension(item.width),
        height: toDimension(item.height),
        sort_order: nextSort + index,
      })),
    );

    if (appendError) {
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      slug: target.slug,
      merged: true,
      added: freshItems.length,
      skipped,
    });
  }

  // --- Criar um board novo -------------------------------------------------
  // O nome é obrigatório ao criar (no append o destino já tem nome próprio).
  if (!title) {
    return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  }

  // Slug único — a constraint `unique` da tabela é a fonte da verdade; em
  // colisão (raríssima) gera outro slug e tenta de novo.
  let boardId: string | null = null;
  let slug = "";
  for (let attempt = 0; attempt < SLUG_RETRIES; attempt++) {
    slug = nanoid(SLUG_LEN);
    const { data, error } = await supabase
      .from("boards")
      .insert({ user_id: user.id, title, search_term: searchTerm, slug })
      .select("id")
      .single();

    if (!error && data) {
      boardId = data.id;
      break;
    }
    if (error && error.code !== "23505") {
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
    }
  }

  if (!boardId) {
    return NextResponse.json({ ok: false, error: "slug_collision" }, { status: 500 });
  }

  const { error: imagesError } = await supabase.from("board_images").insert(
    items.map((item, index) => ({
      board_id: boardId!,
      unsplash_id: item.unsplashId,
      image_url: item.imageUrl,
      thumb_url: item.thumbUrl,
      author: item.author,
      description: item.description,
      width: toDimension(item.width),
      height: toDimension(item.height),
      sort_order: index,
    })),
  );

  if (imagesError) {
    // Não deixa um board sem imagens para trás.
    await supabase.from("boards").delete().eq("id", boardId);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
