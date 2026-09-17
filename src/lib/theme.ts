export type SiteTheme = {
  theme_mode: 'dark' | 'light' | 'system';
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

export const DEFAULT_THEME: SiteTheme = {
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

export function applySiteTheme(theme: Partial<SiteTheme>) {
  const root = document.documentElement;

  const current = {
    ...DEFAULT_THEME,
    ...theme,
  };

  root.style.setProperty('--color-primary', current.color_primary);
  root.style.setProperty('--color-secondary', current.color_secondary);
  root.style.setProperty('--color-accent', current.color_accent);

  root.style.setProperty(
    '--color-background',
    current.color_background,
  );

  root.style.setProperty(
    '--color-background-secondary',
    current.color_background_secondary,
  );

  root.style.setProperty('--color-card', current.color_card);
  root.style.setProperty('--color-border', current.color_border);

  root.style.setProperty('--color-text', current.color_text);
  root.style.setProperty(
    '--color-text-secondary',
    current.color_text_secondary,
  );

  root.style.setProperty(
    '--color-on-primary',
    current.color_on_primary,
  );

  root.style.setProperty('--color-link', current.color_link);

  root.style.setProperty('--color-success', current.color_success);
  root.style.setProperty('--color-warning', current.color_warning);
  root.style.setProperty('--color-error', current.color_error);

  root.style.setProperty('--gradient-start', current.gradient_start);
  root.style.setProperty('--gradient-end', current.gradient_end);

  root.style.setProperty('--glow-color', current.glow_color);
  root.style.setProperty(
    '--glow-intensity',
    String(current.glow_intensity),
  );

  root.style.setProperty(
    '--border-radius',
    current.border_radius,
  );

  root.style.setProperty(
    '--animations-enabled',
    current.animations_enabled ? '1' : '0',
  );

  root.dataset.theme = current.theme_mode;
  root.dataset.activeTheme = current.active_theme;

  document.title = current.site_title;

  if (current.favicon_url) {
    let favicon = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"]',
    );

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }

    favicon.href = current.favicon_url;
  }
}