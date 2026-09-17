import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  Loader2,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

type ThemeMode = 'dark' | 'light' | 'system';

type ThemeSettings = {
  theme_mode: ThemeMode;
  active_theme: string;
  theme_name: string;

  color_primary: string;
  color_secondary: string;
  color_accent: string;

  color_background: string;
  color_background_secondary: string;
  color_card: string;
  color_border: string;

  color_text: string;
  color_text_secondary: string;
  color_on_primary: string;
  color_link: string;

  color_success: string;
  color_warning: string;
  color_error: string;

  gradient_start: string;
  gradient_end: string;

  glow_color: string;
  glow_intensity: number;

  border_radius: string;
  animations_enabled: boolean;

  logo_url: string;
  favicon_url: string;

  site_title: string;
  site_description: string;

  maintenance_mode: boolean;
  maintenance_message: string;
};

type SiteSettingsRow = ThemeSettings & {
  id: string;
  updated_at?: string;
};

const DEFAULT_THEME: ThemeSettings = {
  theme_mode: 'dark',
  active_theme: 'theme_neon_tech',
  theme_name: 'Neon Tech',

  color_primary: '#00FF88',
  color_secondary: '#00C2FF',
  color_accent: '#8B5CF6',

  color_background: '#050505',
  color_background_secondary: '#0A0A0A',
  color_card: '#111111',
  color_border: '#222222',

  color_text: '#FFFFFF',
  color_text_secondary: '#A1A1AA',
  color_on_primary: '#050505',
  color_link: '#00C2FF',

  color_success: '#22C55E',
  color_warning: '#F59E0B',
  color_error: '#EF4444',

  gradient_start: '#00FF88',
  gradient_end: '#00C2FF',

  glow_color: '#00FF88',
  glow_intensity: 0.35,

  border_radius: '16px',
  animations_enabled: true,

  logo_url: '',
  favicon_url: '',

  site_title: 'Jonash.dev | Tecnologia • IA • Projetos',
  site_description:
    'Portfólio profissional de Jonas Henrique — tecnologia, IA e projetos reais.',

  maintenance_mode: false,
  maintenance_message:
    'Estamos realizando melhorias. Voltaremos em breve.',
};

const THEME_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  values: Partial<ThemeSettings>;
}> = [
  {
    id: 'theme_neon_tech',
    name: 'Neon Tech',
    description: 'Verde neon + azul tecnológico',
    values: {
      theme_name: 'Neon Tech',
      color_primary: '#00FF88',
      color_secondary: '#00C2FF',
      color_accent: '#8B5CF6',
      color_background: '#050505',
      color_background_secondary: '#0A0A0A',
      color_card: '#111111',
      color_border: '#222222',
      color_text: '#FFFFFF',
      color_text_secondary: '#A1A1AA',
      color_on_primary: '#050505',
      color_link: '#00C2FF',
      gradient_start: '#00FF88',
      gradient_end: '#00C2FF',
      glow_color: '#00FF88',
    },
  },
  {
    id: 'theme_ocean',
    name: 'Ocean',
    description: 'Azul profundo + ciano',
    values: {
      theme_name: 'Ocean',
      color_primary: '#00C2FF',
      color_secondary: '#2563EB',
      color_accent: '#06B6D4',
      color_background: '#020617',
      color_background_secondary: '#0F172A',
      color_card: '#111827',
      color_border: '#1E293B',
      color_text: '#FFFFFF',
      color_text_secondary: '#94A3B8',
      color_on_primary: '#FFFFFF',
      color_link: '#38BDF8',
      gradient_start: '#00C2FF',
      gradient_end: '#2563EB',
      glow_color: '#00C2FF',
    },
  },
  {
    id: 'theme_purple',
    name: 'Purple',
    description: 'Roxo moderno + índigo',
    values: {
      theme_name: 'Purple',
      color_primary: '#8B5CF6',
      color_secondary: '#6366F1',
      color_accent: '#C084FC',
      color_background: '#09090B',
      color_background_secondary: '#18181B',
      color_card: '#18181B',
      color_border: '#27272A',
      color_text: '#FFFFFF',
      color_text_secondary: '#A1A1AA',
      color_on_primary: '#FFFFFF',
      color_link: '#A78BFA',
      gradient_start: '#8B5CF6',
      gradient_end: '#6366F1',
      glow_color: '#8B5CF6',
    },
  },
  {
    id: 'theme_green',
    name: 'Green',
    description: 'Verde profissional',
    values: {
      theme_name: 'Green',
      color_primary: '#22C55E',
      color_secondary: '#10B981',
      color_accent: '#84CC16',
      color_background: '#020A06',
      color_background_secondary: '#07130C',
      color_card: '#0A1A10',
      color_border: '#15351F',
      color_text: '#FFFFFF',
      color_text_secondary: '#A7F3D0',
      color_on_primary: '#FFFFFF',
      color_link: '#34D399',
      gradient_start: '#22C55E',
      gradient_end: '#10B981',
      glow_color: '#22C55E',
    },
  },
  {
    id: 'theme_minimal',
    name: 'Minimal',
    description: 'Visual limpo e discreto',
    values: {
      theme_name: 'Minimal',
      color_primary: '#18181B',
      color_secondary: '#3F3F46',
      color_accent: '#6366F1',
      color_background: '#FFFFFF',
      color_background_secondary: '#F4F4F5',
      color_card: '#FFFFFF',
      color_border: '#E4E4E7',
      color_text: '#18181B',
      color_text_secondary: '#52525B',
      color_on_primary: '#FFFFFF',
      color_link: '#4F46E5',
      gradient_start: '#18181B',
      gradient_end: '#6366F1',
      glow_color: '#6366F1',
    },
  },
];

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return { r: 0, g: 255, b: 136 };
  }

  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
}

function applyTheme(theme: ThemeSettings) {
  const root = document.documentElement;
  const rgb = hexToRgb(theme.glow_color);

  root.style.setProperty('--color-primary', theme.color_primary);
  root.style.setProperty('--color-secondary', theme.color_secondary);
  root.style.setProperty('--color-accent', theme.color_accent);

  root.style.setProperty('--color-background', theme.color_background);
  root.style.setProperty(
    '--color-background-secondary',
    theme.color_background_secondary,
  );

  root.style.setProperty('--color-card', theme.color_card);
  root.style.setProperty('--color-border', theme.color_border);

  root.style.setProperty('--color-text', theme.color_text);
  root.style.setProperty(
    '--color-text-secondary',
    theme.color_text_secondary,
  );

  root.style.setProperty('--color-on-primary', theme.color_on_primary);
  root.style.setProperty('--color-link', theme.color_link);

  root.style.setProperty('--color-success', theme.color_success);
  root.style.setProperty('--color-warning', theme.color_warning);
  root.style.setProperty('--color-error', theme.color_error);

  root.style.setProperty('--gradient-start', theme.gradient_start);
  root.style.setProperty('--gradient-end', theme.gradient_end);

  root.style.setProperty('--glow-color', theme.glow_color);
  root.style.setProperty('--glow-intensity', String(theme.glow_intensity));

  root.style.setProperty(
    '--glow-rgb',
    `${rgb.r}, ${rgb.g}, ${rgb.b}`,
  );

  root.style.setProperty('--border-radius', theme.border_radius);

  root.style.setProperty(
    '--animations-enabled',
    theme.animations_enabled ? '1' : '0',
  );

  root.dataset.theme = theme.theme_mode;
  root.dataset.activeTheme = theme.active_theme;

  root.style.colorScheme =
    theme.theme_mode === 'light'
      ? 'light'
      : theme.theme_mode === 'dark'
        ? 'dark'
        : 'normal';
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
        />

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl backdrop-blur-xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-zinc-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

export default function AdminAppearance() {
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [settings, setSettings] =
    useState<ThemeSettings>(DEFAULT_THEME);

  const [originalSettings, setOriginalSettings] =
    useState<ThemeSettings>(DEFAULT_THEME);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasChanges = useMemo(
    () =>
      JSON.stringify(settings) !== JSON.stringify(originalSettings),
    [settings, originalSettings],
  );

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  async function loadSettings() {
    try {
      setLoading(true);
      setError('');

      const { data, error: supabaseError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        const row = data as SiteSettingsRow;

        const loadedSettings: ThemeSettings = {
          ...DEFAULT_THEME,
          ...row,
        };

        setSettingsId(row.id);
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);

        applyTheme(loadedSettings);
      } else {
        setSettings(DEFAULT_THEME);
        setOriginalSettings(DEFAULT_THEME);
      }
    } catch (err) {
      console.error(err);

      setError(
        'Não foi possível carregar as configurações de aparência.',
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSetting<K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage('');
    setError('');
  }

  function selectPreset(
    preset: (typeof THEME_PRESETS)[number],
  ) {
    setSettings((current) => ({
      ...current,
      ...preset.values,
      active_theme: preset.id,
    }));

    setMessage('');
  }

  function resetChanges() {
    setSettings(originalSettings);
    applyTheme(originalSettings);
    setMessage('');
    setError('');
  }

  async function saveSettings() {
    if (!settingsId) {
      setError(
        'Nenhum registro de site_settings foi encontrado.',
      );
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const payload = {
        theme_mode: settings.theme_mode,
        active_theme: settings.active_theme,
        theme_name: settings.theme_name,

        color_primary: settings.color_primary,
        color_secondary: settings.color_secondary,
        color_accent: settings.color_accent,

        color_background: settings.color_background,
        color_background_secondary:
          settings.color_background_secondary,

        color_card: settings.color_card,
        color_border: settings.color_border,

        color_text: settings.color_text,
        color_text_secondary: settings.color_text_secondary,
        color_on_primary: settings.color_on_primary,
        color_link: settings.color_link,

        color_success: settings.color_success,
        color_warning: settings.color_warning,
        color_error: settings.color_error,

        gradient_start: settings.gradient_start,
        gradient_end: settings.gradient_end,

        glow_color: settings.glow_color,
        glow_intensity: settings.glow_intensity,

        border_radius: settings.border_radius,
        animations_enabled: settings.animations_enabled,

        logo_url: settings.logo_url || null,
        favicon_url: settings.favicon_url || null,

        site_title: settings.site_title,
        site_description: settings.site_description,

        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message,
      };

      const { error: supabaseError } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', settingsId);

      if (supabaseError) {
        throw supabaseError;
      }

      setOriginalSettings(settings);

      applyTheme(settings);

      window.dispatchEvent(
        new CustomEvent('jonash-theme-updated', {
          detail: settings,
        }),
      );

      setMessage('Aparência salva com sucesso.');
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar a aparência.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando aparência...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-cyan-400">
            <Palette className="h-5 w-5" />
            <span className="text-sm font-medium">
              Personalização do site
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Aparência
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Personalize o visual do Jonash.dev e veja as alterações
            imediatamente no preview.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetChanges}
            disabled={!hasChanges || saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>

          <button
            type="button"
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-5 text-sm font-bold text-[var(--color-on-primary)] shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <Check className="h-5 w-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* CONFIGURAÇÕES */}
        <div className="space-y-6">
          {/* PRESETS */}
          <Section
            title="Temas"
            description="Escolha uma identidade visual e personalize os detalhes abaixo."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {THEME_PRESETS.map((preset) => {
                const active =
                  settings.active_theme === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-cyan-400/60 bg-cyan-400/10'
                        : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div
                      className="mb-4 h-16 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${preset.values.gradient_start}, ${preset.values.gradient_end})`,
                        boxShadow: `0 0 30px ${preset.values.glow_color}33`,
                      }}
                    />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {preset.name}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-400">
                          {preset.description}
                        </p>
                      </div>

                      {active && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-black">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* MODO */}
          <Section
            title="Modo de exibição"
            description="Defina como o site deve tratar o tema."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: 'dark' as const,
                  label: 'Escuro',
                  icon: Moon,
                },
                {
                  id: 'light' as const,
                  label: 'Claro',
                  icon: Sun,
                },
                {
                  id: 'system' as const,
                  label: 'Sistema',
                  icon: Monitor,
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const active =
                  settings.theme_mode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      updateSetting('theme_mode', mode.id)
                    }
                    className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                      active
                        ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                        : 'border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* CORES */}
          <Section
            title="Cores principais"
            description="Controle as cores utilizadas no sistema de design."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Cor primária"
                value={settings.color_primary}
                onChange={(value) =>
                  updateSetting('color_primary', value)
                }
              />

              <ColorField
                label="Cor secundária"
                value={settings.color_secondary}
                onChange={(value) =>
                  updateSetting('color_secondary', value)
                }
              />

              <ColorField
                label="Cor de destaque"
                value={settings.color_accent}
                onChange={(value) =>
                  updateSetting('color_accent', value)
                }
              />

              <ColorField
                label="Links"
                value={settings.color_link}
                onChange={(value) =>
                  updateSetting('color_link', value)
                }
              />
            </div>
          </Section>

          {/* BACKGROUND */}
          <Section
            title="Fundo e cartões"
            description="Configure a estrutura visual das páginas."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Fundo principal"
                value={settings.color_background}
                onChange={(value) =>
                  updateSetting('color_background', value)
                }
              />

              <ColorField
                label="Fundo secundário"
                value={settings.color_background_secondary}
                onChange={(value) =>
                  updateSetting(
                    'color_background_secondary',
                    value,
                  )
                }
              />

              <ColorField
                label="Cards"
                value={settings.color_card}
                onChange={(value) =>
                  updateSetting('color_card', value)
                }
              />

              <ColorField
                label="Bordas"
                value={settings.color_border}
                onChange={(value) =>
                  updateSetting('color_border', value)
                }
              />
            </div>
          </Section>

          {/* TEXTOS */}
          <Section
            title="Tipografia"
            description="Cores para textos e elementos de leitura."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Texto principal"
                value={settings.color_text}
                onChange={(value) =>
                  updateSetting('color_text', value)
                }
              />

              <ColorField
                label="Texto secundário"
                value={settings.color_text_secondary}
                onChange={(value) =>
                  updateSetting('color_text_secondary', value)
                }
              />

              <ColorField
                label="Texto sobre primária"
                value={settings.color_on_primary}
                onChange={(value) =>
                  updateSetting('color_on_primary', value)
                }
              />
            </div>
          </Section>

          {/* GRADIENTE */}
          <Section
            title="Gradiente"
            description="Defina as duas cores utilizadas nos gradientes."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Início"
                value={settings.gradient_start}
                onChange={(value) =>
                  updateSetting('gradient_start', value)
                }
              />

              <ColorField
                label="Final"
                value={settings.gradient_end}
                onChange={(value) =>
                  updateSetting('gradient_end', value)
                }
              />
            </div>

            <div
              className="mt-5 h-24 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${settings.gradient_start}, ${settings.gradient_end})`,
              }}
            />
          </Section>

          {/* GLOW */}
          <Section
            title="Glow e efeitos"
            description="Controle o brilho dos elementos tecnológicos."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Cor do glow"
                value={settings.glow_color}
                onChange={(value) =>
                  updateSetting('glow_color', value)
                }
              />

              <div>
                <label className="text-sm font-medium text-white">
                  Intensidade do glow
                </label>

                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.glow_intensity}
                    onChange={(event) =>
                      updateSetting(
                        'glow_intensity',
                        Number(event.target.value),
                      )
                    }
                    className="w-full"
                  />

                  <span className="w-14 text-right text-sm text-zinc-400">
                    {Math.round(
                      settings.glow_intensity * 100,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div
              className="mt-6 flex h-24 items-center justify-center rounded-2xl border border-white/10"
              style={{
                boxShadow: `0 0 45px rgba(var(--glow-rgb), ${settings.glow_intensity})`,
              }}
            >
              <Sparkles
                className="h-8 w-8"
                style={{
                  color: settings.glow_color,
                }}
              />
            </div>
          </Section>

          {/* LAYOUT */}
          <Section
            title="Layout e animações"
            description="Ajustes visuais gerais da interface."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-white">
                  Raio das bordas
                </label>

                <select
                  value={settings.border_radius}
                  onChange={(event) =>
                    updateSetting(
                      'border_radius',
                      event.target.value,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-400"
                >
                  <option value="0px">Sem arredondamento</option>
                  <option value="8px">8px</option>
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="999px">Pill</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4">
                  <span className="text-sm text-white">
                    Animações ativadas
                  </span>

                  <input
                    type="checkbox"
                    checked={settings.animations_enabled}
                    onChange={(event) =>
                      updateSetting(
                        'animations_enabled',
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>
              </div>
            </div>
          </Section>

          {/* IDENTIDADE */}
          <Section
            title="Identidade do site"
            description="Informações básicas utilizadas pelo site."
          >
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-white">
                  Título do site
                </label>

                <input
                  value={settings.site_title}
                  onChange={(event) =>
                    updateSetting(
                      'site_title',
                      event.target.value,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">
                  Descrição
                </label>

                <textarea
                  value={settings.site_description}
                  onChange={(event) =>
                    updateSetting(
                      'site_description',
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">
                  Logo URL
                </label>

                <input
                  value={settings.logo_url}
                  onChange={(event) =>
                    updateSetting(
                      'logo_url',
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">
                  Favicon URL
                </label>

                <input
                  value={settings.favicon_url}
                  onChange={(event) =>
                    updateSetting(
                      'favicon_url',
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </Section>

          {/* MANUTENÇÃO */}
          <Section
            title="Modo manutenção"
            description="Permite colocar o site em manutenção."
          >
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="font-medium text-white">
                    Ativar modo manutenção
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    O site poderá exibir uma mensagem de manutenção.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(event) =>
                    updateSetting(
                      'maintenance_mode',
                      event.target.checked,
                    )
                  }
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>

              <textarea
                value={settings.maintenance_message}
                onChange={(event) =>
                  updateSetting(
                    'maintenance_message',
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="Mensagem de manutenção..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </Section>
        </div>

        {/* PREVIEW */}
        <aside className="xl:sticky xl:top-6 xl:h-fit">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />

                <span className="text-sm font-semibold text-white">
                  Preview em tempo real
                </span>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                AO VIVO
              </span>
            </div>

            <div
              className="min-h-[620px] p-5 transition-all"
              style={{
                background: settings.color_background,
                color: settings.color_text,
              }}
            >
              {/* MINI NAVBAR */}
              <div
                className="mb-8 flex items-center justify-between rounded-2xl border p-3"
                style={{
                  background:
                    settings.color_background_secondary,
                  borderColor: settings.color_border,
                  borderRadius: settings.border_radius,
                }}
              >
                <div className="flex items-center gap-2">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black"
                      style={{
                        background: settings.color_primary,
                        color: settings.color_on_primary,
                      }}
                    >
                      J
                    </div>
                  )}

                  <span
                    className="text-sm font-bold"
                    style={{
                      color: settings.color_text,
                    }}
                  >
                    Jonash.dev
                  </span>
                </div>

                <div className="hidden gap-3 text-[10px] sm:flex">
                  <span
                    style={{
                      color: settings.color_text_secondary,
                    }}
                  >
                    Projetos
                  </span>

                  <span
                    style={{
                      color: settings.color_text_secondary,
                    }}
                  >
                    Sobre
                  </span>

                  <span
                    style={{
                      color: settings.color_link,
                    }}
                  >
                    Contato
                  </span>
                </div>
              </div>

              {/* HERO */}
              <div className="mb-8">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px]"
                  style={{
                    borderColor: `${settings.color_primary}55`,
                    background: `${settings.color_primary}12`,
                    color: settings.color_primary,
                    borderRadius: '999px',
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  Tecnologia • IA • Projetos
                </div>

                <h2
                  className="text-3xl font-black leading-tight"
                  style={{
                    color: settings.color_text,
                  }}
                >
                  Transformando ideias em{' '}
                  <span
                    style={{
                      background: `linear-gradient(90deg, ${settings.gradient_start}, ${settings.gradient_end})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    projetos reais.
                  </span>
                </h2>

                <p
                  className="mt-4 text-sm leading-6"
                  style={{
                    color: settings.color_text_secondary,
                  }}
                >
                  Desenvolvimento, inteligência artificial e
                  projetos construídos na prática.
                </p>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl px-4 py-2.5 text-xs font-bold"
                    style={{
                      background: `linear-gradient(90deg, ${settings.gradient_start}, ${settings.gradient_end})`,
                      color: settings.color_on_primary,
                      borderRadius: settings.border_radius,
                      boxShadow: `0 0 25px rgba(var(--glow-rgb), ${settings.glow_intensity})`,
                    }}
                  >
                    Ver projetos
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border px-4 py-2.5 text-xs font-medium"
                    style={{
                      borderColor: settings.color_border,
                      color: settings.color_text,
                      borderRadius: settings.border_radius,
                    }}
                  >
                    Conhecer
                  </button>
                </div>
              </div>

              {/* CARDS */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {[
                  {
                    title: 'Desenvolvimento',
                    text: 'Sites, sistemas e aplicações.',
                    color: settings.color_primary,
                  },
                  {
                    title: 'Inteligência Artificial',
                    text: 'IA aplicada a projetos reais.',
                    color: settings.color_secondary,
                  },
                  {
                    title: 'Projetos',
                    text: 'Construindo, testando e evoluindo.',
                    color: settings.color_accent,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border p-4"
                    style={{
                      background: settings.color_card,
                      borderColor: settings.color_border,
                      borderRadius: settings.border_radius,
                    }}
                  >
                    <div
                      className="mb-3 h-1.5 w-10 rounded-full"
                      style={{
                        background: item.color,
                      }}
                    />

                    <h3
                      className="text-sm font-bold"
                      style={{
                        color: settings.color_text,
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      className="mt-1 text-xs leading-5"
                      style={{
                        color: settings.color_text_secondary,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div
                className="mt-8 border-t pt-5 text-center text-[10px]"
                style={{
                  borderColor: settings.color_border,
                  color: settings.color_text_secondary,
                }}
              >
                Aprendendo. Criando. Evoluindo. 🚀
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM SAVE */}
      {hasChanges && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-zinc-950/90 p-4 shadow-2xl backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold text-white">
              Existem alterações não salvas
            </p>

            <p className="text-xs text-zinc-400">
              O preview já foi atualizado, mas ainda não foi salvo no
              banco.
            </p>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Salvar
          </button>
        </div>
      )}
    </div>
  );
}