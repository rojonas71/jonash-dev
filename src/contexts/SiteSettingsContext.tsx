import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

export type SiteSettings = {
  id?: string;

  site_name: string;
  slogan: string;

  hero_title: string;
  hero_subtitle: string;

  logo_url: string | null;
  favicon_url: string | null;

  seo_title: string;
  seo_description: string;

  footer_text: string;

  maintenance_mode: boolean;
  maintenance_message: string;

  updated_at?: string;
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "Jonash.dev",
  slogan: "Tecnologia • IA • Projetos",

  hero_title: "Transformando ideias em soluções digitais.",
  hero_subtitle:
    "Desenvolvimento de sistemas, sites, aplicativos e soluções com IA.",

  logo_url: null,
  favicon_url: null,

  seo_title: "Jonash.dev | Tecnologia • IA • Projetos",

  seo_description:
    "Jonash.dev — desenvolvimento de sistemas, sites, aplicativos e soluções digitais com tecnologia e inteligência artificial.",

  footer_text: "Aprendendo. Criando. Evoluindo. 🚀",

  maintenance_mode: false,

  maintenance_message:
    "Estamos realizando algumas melhorias. Voltaremos em breve.",
};

type SiteSettingsContextType = {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
};

const SiteSettingsContext =
  createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(
    DEFAULT_SITE_SETTINGS
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("site_settings")
        .select(
          `
            id,
            site_name,
            slogan,
            hero_title,
            hero_subtitle,
            logo_url,
            favicon_url,
            seo_title,
            seo_description,
            footer_text,
            maintenance_mode,
            maintenance_message,
            updated_at
          `
        )
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (supabaseError) {
        console.error(
          "[SiteSettings] Erro ao carregar configurações:",
          supabaseError
        );

        setError(supabaseError.message);
        return;
      }

      if (data) {
        setSettings({
          ...DEFAULT_SITE_SETTINGS,
          ...data,
        });
      }
    } catch (err) {
      console.error(
        "[SiteSettings] Erro inesperado:",
        err
      );

      setError(
        "Não foi possível carregar as configurações do site."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  /*
   * Atualiza configurações automaticamente quando o usuário
   * salva alterações no painel administrativo em outra aba.
   */
  useEffect(() => {
    const channel = supabase
      .channel("site-settings-global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      refreshSettings: loadSettings,
    }),
    [settings, loading, error]
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error(
      "useSiteSettings deve ser usado dentro de SiteSettingsProvider."
    );
  }

  return context;
}