import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { isSupabaseConfigured } from "../../lib/supabase";

export default function SupabaseStatus() {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="supabase-status supabase-status--error">
      <AlertTriangle size={18} />

      <div>
        <strong>Supabase não configurado</strong>
        <p>
          Verifique as variáveis VITE_SUPABASE_URL e
          VITE_SUPABASE_ANON_KEY no ambiente do projeto.
        </p>
      </div>
    </div>
  );
}