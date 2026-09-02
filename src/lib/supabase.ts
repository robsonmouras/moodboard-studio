import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase do lado do browser.
 *
 * Escopo desta fase: apenas instanciar o client a partir das variáveis de ambiente.
 * Sem fluxo de login, sem hooks de sessão e sem chamadas ao banco — isso entra
 * só na fase de autenticação (Fase 3 do documento técnico).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Falha cedo e explícita em vez de erro obscuro em runtime.
  throw new Error(
    "Supabase: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (veja .env.local.example).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
