import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Jonash.dev] Supabase não configurado. " +
      "Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

/**
 * Cliente Supabase principal.
 *
 * Mantemos o tipo do cliente estável para que as páginas
 * existentes não precisem fazer `if (!supabase)` em todas
 * as consultas.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);