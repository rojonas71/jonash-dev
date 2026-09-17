import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  applySiteTheme,
  DEFAULT_THEME,
  SiteTheme,
} from '../lib/theme';

export function useSiteTheme() {
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTheme() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          'Erro ao carregar tema:',
          error,
        );

        applySiteTheme(DEFAULT_THEME);

        if (mounted) {
          setTheme(DEFAULT_THEME);
          setLoading(false);
        }

        return;
      }

      const loadedTheme: SiteTheme = {
        ...DEFAULT_THEME,
        ...(data || {}),
      };

      if (mounted) {
        setTheme(loadedTheme);
        applySiteTheme(loadedTheme);
        setLoading(false);
      }
    }

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    theme,
    loading,
  };
}