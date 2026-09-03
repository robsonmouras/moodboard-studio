import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase do lado do servidor (Server Components, Route Handlers, Server Actions).
 *
 * Lê e escreve a sessão nos cookies da request via `next/headers`. Em Server
 * Components a escrita de cookie não é permitida — o `try/catch` no `setAll`
 * cobre esse caso; a renovação de sessão fica a cargo do middleware
 * (`updateSession`).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (veja .env.local.example).",
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` chamado de um Server Component — sem acesso de escrita a
          // cookie. O middleware renova a sessão, então é seguro ignorar aqui.
        }
      },
    },
  });
}
