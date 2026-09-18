import { useEffect } from "react";
import { useSiteSettings } from "../contexts/SiteSettingsContext";

export default function SiteMeta() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const title =
      settings.seo_title ||
      settings.site_name ||
      "Jonash.dev";

    document.title = title;

    const description =
      settings.seo_description ||
      settings.slogan ||
      "Tecnologia • IA • Projetos";

    let descriptionMeta = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.name = "description";
      document.head.appendChild(descriptionMeta);
    }

    descriptionMeta.content = description;

    if (settings.favicon_url) {
      let favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement | null;

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = settings.favicon_url;
    }

    if (settings.site_name) {
      let themeColor = document.querySelector(
        'meta[name="theme-color"]'
      ) as HTMLMetaElement | null;

      if (!themeColor) {
        themeColor = document.createElement("meta");
        themeColor.name = "theme-color";
        document.head.appendChild(themeColor);
      }

      themeColor.content = "#050505";
    }
  }, [settings]);

  return null;
}