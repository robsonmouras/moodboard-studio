import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase do lado do browser (client components).
 *
 * Lê a sessão dos cookies gravados pelo `@supabase/ssr` — a mesma sessão que o
 * client de servidor (`server.ts`) e o middleware enxergam. Use para auth
 * (`signInWithPassword`, `signUp`, `signOut`, `onAuthStateChange`) e leituras
 * pontuais em client components.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (veja .env.local.example).",
  );
}

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
