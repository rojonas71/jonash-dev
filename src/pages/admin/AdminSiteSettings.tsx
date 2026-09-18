import {
  AlertCircle,
  CheckCircle2,
  Globe2,
  Loader2,
  Save,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type SiteSettings = {
  id?: string;
  site_name: string;
  slogan: string;
  hero_title: string;
  hero_subtitle: string;
  logo_url: string;
  favicon_url: string;
  seo_title: string;
  seo_description: string;
  footer_text: string;
  maintenance_mode: boolean;
  maintenance_message: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Jonash.dev",
  slogan: "Tecnologia • IA • Projetos",
  hero_title: "Transformando ideias em soluções digitais.",
  hero_subtitle:
    "Desenvolvimento de sistemas, sites, aplicativos e soluções com IA.",
  logo_url: "",
  favicon_url: "",
  seo_title: "Jonash.dev | Tecnologia • IA • Projetos",
  seo_description:
    "Jonash.dev — desenvolvimento de sistemas, sites, aplicativos e soluções digitais com tecnologia e inteligência artificial.",
  footer_text: "Aprendendo. Criando. Evoluindo. 🚀",
  maintenance_mode: false,
  maintenance_message:
    "Estamos realizando algumas melhorias. Voltaremos em breve.",
};

export default function AdminSiteSettings() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("site_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[AdminSiteSettings]", fetchError);
      setError("Não foi possível carregar as configurações do site.");
      setLoading(false);
      return;
    }

    if (data) {
      setForm({
        ...DEFAULT_SETTINGS,
        ...data,
      });
    }

    setLoading(false);
  }

  function updateField<K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      site_name: form.site_name.trim(),
      slogan: form.slogan.trim(),
      hero_title: form.hero_title.trim(),
      hero_subtitle: form.hero_subtitle.trim(),
      logo_url: form.logo_url.trim() || null,
      favicon_url: form.favicon_url.trim() || null,
      seo_title: form.seo_title.trim(),
      seo_description: form.seo_description.trim(),
      footer_text: form.footer_text.trim(),
      maintenance_mode: form.maintenance_mode,
      maintenance_message: form.maintenance_message.trim(),
      updated_at: new Date().toISOString(),
    };

    let result;

    if (form.id) {
      result = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", form.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("site_settings")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      console.error("[AdminSiteSettings]", result.error);
      setError(
        result.error.message ||
          "Não foi possível salvar as configurações."
      );
      setSaving(false);
      return;
    }

    setForm((current) => ({
      ...current,
      ...result.data,
    }));

    setMessage("Configurações salvas com sucesso.");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="admin-settings-loading">
        <Loader2 className="spin" size={28} />
        <span>Carregando configurações...</span>
      </div>
    );
  }

  return (
    <section className="admin-site-settings">
      <div className="admin-site-settings__header">
        <div>
          <span className="admin-site-settings__eyebrow">
            CONFIGURAÇÕES
          </span>

          <h1>Configurações do site</h1>

          <p>
            Gerencie identidade, SEO, Hero, rodapé e modo de manutenção
            do Jonash.dev.
          </p>
        </div>

        <div className="admin-site-settings__status">
          <ShieldCheck size={18} />
          <span>Área administrativa</span>
        </div>
      </div>

      {error && (
        <div className="admin-site-settings__alert admin-site-settings__alert--error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="admin-site-settings__alert admin-site-settings__alert--success">
          <CheckCircle2 size={20} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* IDENTIDADE */}
        <div className="admin-site-settings__card">
          <div className="admin-site-settings__card-header">
            <div className="admin-site-settings__card-icon">
              <Globe2 size={21} />
            </div>

            <div>
              <h2>Identidade</h2>
              <p>Informações principais da marca.</p>
            </div>
          </div>

          <div className="admin-site-settings__grid">
            <label>
              <span>Nome do site</span>
              <input
                value={form.site_name}
                onChange={(e) =>
                  updateField("site_name", e.target.value)
                }
                placeholder="Jonash.dev"
              />
            </label>

            <label>
              <span>Slogan</span>
              <input
                value={form.slogan}
                onChange={(e) =>
                  updateField("slogan", e.target.value)
                }
                placeholder="Tecnologia • IA • Projetos"
              />
            </label>

            <label>
              <span>Logo URL</span>
              <input
                type="url"
                value={form.logo_url}
                onChange={(e) =>
                  updateField("logo_url", e.target.value)
                }
                placeholder="https://..."
              />
            </label>

            <label>
              <span>Favicon URL</span>
              <input
                type="url"
                value={form.favicon_url}
                onChange={(e) =>
                  updateField("favicon_url", e.target.value)
                }
                placeholder="https://..."
              />
            </label>
          </div>
        </div>

        {/* HERO */}
        <div className="admin-site-settings__card">
          <div className="admin-site-settings__card-header">
            <div className="admin-site-settings__card-icon">
              <Globe2 size={21} />
            </div>

            <div>
              <h2>Hero</h2>
              <p>Conteúdo principal exibido na Home.</p>
            </div>
          </div>

          <div className="admin-site-settings__fields">
            <label>
              <span>Título do Hero</span>
              <input
                value={form.hero_title}
                onChange={(e) =>
                  updateField("hero_title", e.target.value)
                }
                placeholder="Transformando ideias em soluções digitais."
              />
            </label>

            <label>
              <span>Subtítulo do Hero</span>
              <textarea
                rows={4}
                value={form.hero_subtitle}
                onChange={(e) =>
                  updateField("hero_subtitle", e.target.value)
                }
                placeholder="Descrição principal..."
              />
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="admin-site-settings__card">
          <div className="admin-site-settings__card-header">
            <div className="admin-site-settings__card-icon">
              <Search size={21} />
            </div>

            <div>
              <h2>SEO</h2>
              <p>Dados utilizados pelos mecanismos de busca.</p>
            </div>
          </div>

          <div className="admin-site-settings__fields">
            <label>
              <span>SEO Title</span>
              <input
                value={form.seo_title}
                onChange={(e) =>
                  updateField("seo_title", e.target.value)
                }
                placeholder="Jonash.dev | Tecnologia • IA • Projetos"
              />

              <small>{form.seo_title.length}/60 caracteres</small>
            </label>

            <label>
              <span>SEO Description</span>
              <textarea
                rows={4}
                value={form.seo_description}
                onChange={(e) =>
                  updateField("seo_description", e.target.value)
                }
                placeholder="Descrição para mecanismos de busca..."
              />

              <small>{form.seo_description.length}/160 caracteres</small>
            </label>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="admin-site-settings__card">
          <div className="admin-site-settings__card-header">
            <div className="admin-site-settings__card-icon">
              <Globe2 size={21} />
            </div>

            <div>
              <h2>Rodapé</h2>
              <p>Texto global exibido no final do site.</p>
            </div>
          </div>

          <label>
            <span>Texto do rodapé</span>
            <input
              value={form.footer_text}
              onChange={(e) =>
                updateField("footer_text", e.target.value)
              }
              placeholder="Aprendendo. Criando. Evoluindo. 🚀"
            />
          </label>
        </div>

        {/* MANUTENÇÃO */}
        <div className="admin-site-settings__card admin-site-settings__card--maintenance">
          <div className="admin-site-settings__card-header">
            <div className="admin-site-settings__card-icon">
              <Wrench size={21} />
            </div>

            <div>
              <h2>Modo manutenção</h2>
              <p>
                Controle temporariamente a disponibilidade do site
                público.
              </p>
            </div>
          </div>

          <label className="admin-site-settings__switch">
            <input
              type="checkbox"
              checked={form.maintenance_mode}
              onChange={(e) =>
                updateField("maintenance_mode", e.target.checked)
              }
            />

            <span className="admin-site-settings__switch-ui" />

            <div>
              <strong>
                {form.maintenance_mode
                  ? "Manutenção ativada"
                  : "Manutenção desativada"}
              </strong>

              <small>
                O painel administrativo continua disponível.
              </small>
            </div>
          </label>

          {form.maintenance_mode && (
            <label className="admin-site-settings__maintenance-message">
              <span>Mensagem de manutenção</span>

              <textarea
                rows={4}
                value={form.maintenance_message}
                onChange={(e) =>
                  updateField(
                    "maintenance_message",
                    e.target.value
                  )
                }
              />
            </label>
          )}
        </div>

        <div className="admin-site-settings__actions">
          <button
            type="submit"
            className="admin-site-settings__save"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={19} className="spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={19} />
                Salvar configurações
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}