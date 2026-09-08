"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions da biblioteca de boards (`/favoritos`).
 *
 * Toda escrita passa pelo client de servidor com a sessão do usuário — a RLS por
 * `user_id` recusa qualquer tentativa de mexer no board de outra pessoa, então
 * não é preciso rechecar posse aqui.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

export async function renameBoard(boardId: string, name: string): Promise<ActionResult> {
  const title = name.trim();
  if (!title) return { ok: false, error: "empty_name" };

  const supabase = await createClient();
  const { error } = await supabase.from("boards").update({ title }).eq("id", boardId);

  if (error) return { ok: false, error: "update_failed" };

  revalidatePath("/favoritos");
  revalidatePath(`/favoritos/${boardId}`);
  return { ok: true };
}

export async function removeBoardImage(
  boardId: string,
  imageId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("board_images").delete().eq("id", imageId);

  if (error) return { ok: false, error: "delete_failed" };

  revalidatePath("/favoritos");
  revalidatePath(`/favoritos/${boardId}`);
  return { ok: true };
}

/**
 * Exclui o board inteiro (o `on delete cascade` cuida das imagens) e volta pra
 * lista. O `?excluido=1` sobrevive à navegação e vira o toast de sucesso em
 * `/favoritos` — a própria lista limpa o query param depois de disparar.
 */
export async function deleteBoard(boardId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("boards").delete().eq("id", boardId);

  if (error) return { ok: false, error: "delete_failed" };

  revalidatePath("/favoritos");
  redirect("/favoritos?excluido=1");
}
