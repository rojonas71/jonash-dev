import { Code2, RefreshCw, Wrench } from "lucide-react";
import { useSiteSettings } from "../contexts/SiteSettingsContext";

export default function Maintenance() {
  const { settings } = useSiteSettings();

  return (
    <main className="maintenance-page">
      <div className="maintenance-page__background" />

      <section className="maintenance-page__content">
        <div className="maintenance-page__icon">
          <Wrench size={34} />
        </div>

        <span className="maintenance-page__badge">
          {settings.site_name}
        </span>

        <h1>
          Estamos preparando
          <br />
          <strong>algo novo.</strong>
        </h1>

        <p>
          {settings.maintenance_message ||
            "Estamos realizando algumas melhorias. Voltaremos em breve."}
        </p>

        <div className="maintenance-page__brand">
          <Code2 size={18} />
          <span>{settings.slogan}</span>
        </div>

        <button
          type="button"
          className="maintenance-page__button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={17} />
          Atualizar página
        </button>
      </section>
    </main>
  );
}