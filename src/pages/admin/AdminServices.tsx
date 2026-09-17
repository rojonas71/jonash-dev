import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Search,
  Star,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  Save,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Service = {
  id: string;
  title: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  icon: string | null;
  image_url: string | null;
  badge: string | null;
  category: string | null;
  published: boolean;
  featured: boolean;
  display_order: number;
  cta_text: string | null;
  cta_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceForm = {
  name: string;
  slug: string;
  category: string;
  icon: string;
  badge: string;
  short_description: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
  published: boolean;
  featured: boolean;
  display_order: number;
  seo_title: string;
  seo_description: string;
};

const categories = [
  "Tecnologia",
  "Desenvolvimento Web",
  "Aplicativos",
  "Sistemas",
  "SaaS",
  "Inteligência Artificial",
  "Automação",
  "Consultoria",
  "Design",
  "Outros",
];

const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  category: "Tecnologia",
  icon: "Code2",
  badge: "",
  short_description: "",
  description: "",
  image_url: "",
  cta_text: "Saiba mais",
  cta_url: "",
  published: true,
  featured: false,
  display_order: 0,
  seo_title: "",
  seo_description: "",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setServices((data ?? []) as Service[]);
    } catch (err: any) {
      console.error("Erro ao carregar serviços:", err);

      setError(
        err?.message ||
          "Não foi possível carregar os serviços."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      return services;
    }

    return services.filter((service) => {
      return [
        service.title,
        service.name,
        service.slug,
        service.category,
        service.description,
        service.short_description,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        );
    });
  }, [services, search]);

  function updateField<K extends keyof ServiceForm>(
    field: K,
    value: ServiceForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingId
        ? current.slug
        : slugify(value),
      seo_title:
        current.seo_title ||
        `${value} | Jonash.dev`,
    }));
  }

  function handleNew() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleEdit(service: Service) {
    setEditingId(service.id);

    setForm({
      name:
        service.name ||
        service.title ||
        "",
      slug:
        service.slug ||
        slugify(
          service.name ||
            service.title ||
            ""
        ),
      category:
        service.category ||
        "Tecnologia",
      icon:
        service.icon ||
        "Code2",
      badge:
        service.badge ||
        "",
      short_description:
        service.short_description ||
        "",
      description:
        service.description ||
        "",
      image_url:
        service.image_url ||
        "",
      cta_text:
        service.cta_text ||
        "Saiba mais",
      cta_url:
        service.cta_url ||
        "",
      published:
        service.published ?? true,
      featured:
        service.featured ?? false,
      display_order:
        service.display_order ?? 0,
      seo_title:
        service.seo_title ||
        `${service.title || service.name} | Jonash.dev`,
      seo_description:
        service.seo_description ||
        service.short_description ||
        "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function validateForm() {
    if (!form.name.trim()) {
      return "Informe o nome do serviço.";
    }

    if (!form.slug.trim()) {
      return "Informe o slug do serviço.";
    }

    if (!form.short_description.trim()) {
      return "Informe uma descrição curta.";
    }

    if (!form.description.trim()) {
      return "Informe a descrição completa.";
    }

    return null;
  }

  async function checkSlugExists(slug: string) {
    let query = supabase
      .from("services")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (editingId) {
      query = query.neq("id", editingId);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    return Boolean(data && data.length > 0);
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const normalizedName =
        form.name.trim();

      const normalizedSlug =
        slugify(form.slug);

      const slugExists =
        await checkSlugExists(
          normalizedSlug
        );

      if (slugExists) {
        setError(
          `O slug "${normalizedSlug}" já está sendo utilizado por outro serviço.`
        );
        return;
      }

      /*
       * IMPORTANTE:
       * A tabela services possui "title" como NOT NULL.
       * Por isso enviamos title E name.
       */

      const payload = {
        title: normalizedName,
        name: normalizedName,
        slug: normalizedSlug,

        category:
          form.category.trim() ||
          "Tecnologia",

        icon:
          form.icon.trim() ||
          "Code2",

        badge:
          form.badge.trim() ||
          null,

        short_description:
          form.short_description.trim(),

        description:
          form.description.trim(),

        image_url:
          form.image_url.trim() ||
          null,

        cta_text:
          form.cta_text.trim() ||
          "Saiba mais",

        cta_url:
          form.cta_url.trim() ||
          null,

        published:
          form.published,

        featured:
          form.featured,

        display_order:
          Number(form.display_order) || 0,

        seo_title:
          form.seo_title.trim() ||
          `${normalizedName} | Jonash.dev`,

        seo_description:
          form.seo_description.trim() ||
          form.short_description.trim(),

        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } =
          await supabase
            .from("services")
            .update(payload)
            .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "Serviço atualizado com sucesso."
        );
      } else {
        const { error: insertError } =
          await supabase
            .from("services")
            .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          "Serviço criado com sucesso."
        );
      }

      await loadServices();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error(
        "Erro ao salvar serviço:",
        err
      );

      if (err?.code === "23505") {
        setError(
          "Já existe um serviço com esse slug."
        );
      } else if (err?.code === "23502") {
        setError(
          "Um campo obrigatório do banco não foi preenchido."
        );
      } else if (err?.code === "42501") {
        setError(
          "Você não possui permissão para alterar serviços."
        );
      } else {
        setError(
          err?.message ||
            "Não foi possível salvar o serviço."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    service: Service
  ) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o serviço "${service.title}"?\n\nEssa ação não pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(service.id);
      setError("");
      setSuccess("");

      const { error: deleteError } =
        await supabase
          .from("services")
          .delete()
          .eq("id", service.id);

      if (deleteError) {
        throw deleteError;
      }

      setServices((current) =>
        current.filter(
          (item) =>
            item.id !== service.id
        )
      );

      setSuccess(
        "Serviço excluído com sucesso."
      );
    } catch (err: any) {
      console.error(
        "Erro ao excluir serviço:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível excluir o serviço."
      );
    } finally {
      setDeleting(null);
    }
  }

  async function togglePublished(
    service: Service
  ) {
    try {
      setError("");

      const newValue =
        !service.published;

      const { error: updateError } =
        await supabase
          .from("services")
          .update({
            published: newValue,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", service.id);

      if (updateError) {
        throw updateError;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? {
                ...item,
                published: newValue,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Não foi possível alterar a publicação."
      );
    }
  }

  async function toggleFeatured(
    service: Service
  ) {
    try {
      setError("");

      const newValue =
        !service.featured;

      const { error: updateError } =
        await supabase
          .from("services")
          .update({
            featured: newValue,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", service.id);

      if (updateError) {
        throw updateError;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? {
                ...item,
                featured: newValue,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Não foi possível alterar o destaque."
      );
    }
  }

  return (
    <div className="admin-services">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="admin-services__header">
        <div className="admin-services__title-wrapper">
          <div className="admin-services__icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <h1 className="admin-services__title">
              Serviços
            </h1>

            <p className="admin-services__subtitle">
              Gerencie os serviços apresentados no
              Jonash.dev.
            </p>
          </div>
        </div>

        <div className="admin-services__actions">
          <button
            type="button"
            className="admin-services__button admin-services__button--primary"
            onClick={handleNew}
          >
            <Plus size={17} />
            Novo serviço
          </button>
        </div>
      </header>

      {/* =====================================================
          ALERTS
          ===================================================== */}

      {error && (
        <div className="admin-services__alert admin-services__alert--error">
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-services__alert admin-services__alert--success">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="admin-services__search">
        <Search
          size={18}
          className="admin-services__search-icon"
        />

        <input
          type="search"
          placeholder="Buscar serviço por nome, categoria ou slug..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* =====================================================
          LIST
          ===================================================== */}

      {loading ? (
        <div className="admin-services__loading">
          <div className="admin-services__spinner" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="admin-services__empty">
          <div className="admin-services__empty-icon">
            <BriefcaseBusiness size={25} />
          </div>

          <h2 className="admin-services__empty-title">
            {search
              ? "Nenhum serviço encontrado"
              : "Nenhum serviço cadastrado"}
          </h2>

          <p className="admin-services__empty-description">
            {search
              ? "Tente pesquisar por outro termo."
              : "Comece cadastrando o primeiro serviço do Jonash.dev."}
          </p>

          {!search && (
            <button
              type="button"
              className="admin-services__button admin-services__button--primary"
              style={{
                marginTop: 18,
              }}
              onClick={handleNew}
            >
              <Plus size={17} />
              Criar primeiro serviço
            </button>
          )}
        </div>
      ) : (
        <div className="admin-services__list">
          {filteredServices.map(
            (service) => (
              <article
                key={service.id}
                className="admin-services__card"
              >
                {/* Icon */}
                <div className="admin-services__service-icon">
                  <BriefcaseBusiness size={21} />
                </div>

                {/* Content */}
                <div className="admin-services__content">
                  <h2 className="admin-services__service-title">
                    {service.title ||
                      service.name}
                  </h2>

                  <p className="admin-services__description">
                    {service.short_description ||
                      service.description ||
                      "Sem descrição."}
                  </p>

                  <div className="admin-services__meta">
                    {service.category && (
                      <span className="admin-services__badge admin-services__badge--category">
                        {service.category}
                      </span>
                    )}

                    {service.published ? (
                      <span className="admin-services__badge admin-services__badge--published">
                        <Check
                          size={11}
                          style={{
                            marginRight: 4,
                          }}
                        />
                        Publicado
                      </span>
                    ) : (
                      <span className="admin-services__badge admin-services__badge--hidden">
                        <EyeOff
                          size={11}
                          style={{
                            marginRight: 4,
                          }}
                        />
                        Oculto
                      </span>
                    )}

                    {service.featured && (
                      <span className="admin-services__badge admin-services__badge--featured">
                        <Star
                          size={11}
                          style={{
                            marginRight: 4,
                          }}
                        />
                        Destaque
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="admin-services__service-actions">
                  <button
                    type="button"
                    className="admin-services__icon-button"
                    title={
                      service.published
                        ? "Ocultar serviço"
                        : "Publicar serviço"
                    }
                    onClick={() =>
                      togglePublished(service)
                    }
                  >
                    {service.published ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="admin-services__icon-button"
                    title={
                      service.featured
                        ? "Remover destaque"
                        : "Destacar serviço"
                    }
                    onClick={() =>
                      toggleFeatured(service)
                    }
                  >
                    <Star
                      size={16}
                      fill={
                        service.featured
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  {service.cta_url && (
                    <a
                      href={service.cta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-services__icon-button"
                      title="Abrir link"
                    >
                      <ExternalLink
                        size={16}
                      />
                    </a>
                  )}

                  <button
                    type="button"
                    className="admin-services__icon-button"
                    title="Editar serviço"
                    onClick={() =>
                      handleEdit(service)
                    }
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    type="button"
                    className="admin-services__icon-button admin-services__icon-button--danger"
                    title="Excluir serviço"
                    disabled={
                      deleting === service.id
                    }
                    onClick={() =>
                      handleDelete(service)
                    }
                  >
                    {deleting === service.id ? (
                      <Loader2
                        size={16}
                        className="spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}

      {/* =====================================================
          MODAL
          ===================================================== */}

      {showForm && (
        <div
          className="admin-services__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className="admin-services__modal">
            <div className="admin-services__modal-header">
              <div>
                <h2 className="admin-services__modal-title">
                  {editingId
                    ? "Editar serviço"
                    : "Novo serviço"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-services__icon-button"
                onClick={closeForm}
                disabled={saving}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="admin-services__form"
              onSubmit={handleSubmit}
            >
              {/* =================================================
                  BASIC
                  ================================================= */}

              <section className="admin-services__section">
                <h3 className="admin-services__section-title">
                  Informações principais
                </h3>

                <div className="admin-services__grid">
                  <div className="admin-services__field admin-services__field--full">
                    <label className="admin-services__label">
                      Nome *
                    </label>

                    <input
                      className="admin-services__input"
                      value={form.name}
                      onChange={(event) =>
                        handleNameChange(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Desenvolvimento de Sites"
                    />
                  </div>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      Slug *
                    </label>

                    <input
                      className="admin-services__input"
                      value={form.slug}
                      onChange={(event) =>
                        updateField(
                          "slug",
                          slugify(
                            event.target.value
                          )
                        )
                      }
                      placeholder="desenvolvimento-de-sites"
                    />

                    <span className="admin-services__hint">
                      Usado na URL do serviço.
                    </span>
                  </div>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      Categoria
                    </label>

                    <select
                      className="admin-services__select"
                      value={form.category}
                      onChange={(event) =>
                        updateField(
                          "category",
                          event.target.value
                        )
                      }
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      Ícone
                    </label>

                    <input
                      className="admin-services__input"
                      value={form.icon}
                      onChange={(event) =>
                        updateField(
                          "icon",
                          event.target.value
                        )
                      }
                      placeholder="Code2"
                    />

                    <span className="admin-services__hint">
                      Nome do ícone utilizado pelo
                      frontend.
                    </span>
                  </div>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      Badge
                    </label>

                    <input
                      className="admin-services__input"
                      value={form.badge}
                      onChange={(event) =>
                        updateField(
                          "badge",
                          event.target.value
                        )
                      }
                      placeholder="Profissional"
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  DESCRIPTION
                  ================================================= */}

              <section className="admin-services__section">
                <h3 className="admin-services__section-title">
                  Descrição
                </h3>

                <div className="admin-services__grid">
                  <div className="admin-services__field admin-services__field--full">
                    <label className="admin-services__label">
                      Descrição curta *
                    </label>

                    <textarea
                      className="admin-services__textarea"
                      value={
                        form.short_description
                      }
                      onChange={(event) =>
                        updateField(
                          "short_description",
                          event.target.value
                        )
                      }
                      placeholder="Descrição resumida do serviço..."
                    />
                  </div>

                  <div className="admin-services__field admin-services__field--full">
                    <label className="admin-services__label">
                      Descrição completa *
                    </label>

                    <textarea
                      className="admin-services__textarea"
                      style={{
                        minHeight: 180,
                      }}
                      value={form.description}
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Explique detalhadamente o serviço, benefícios, processo e entregas..."
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  MEDIA
                  ================================================= */}

              <section className="admin-services__section">
                <h3 className="admin-services__section-title">
                  Imagem e chamada para ação
                </h3>

                <div className="admin-services__grid">
                  <div className="admin-services__field admin-services__field--full">
                    <label className="admin-services__label">
                      URL da imagem
                    </label>

                    <input
                      type="url"
                      className="admin-services__input"
                      value={form.image_url}
                      onChange={(event) =>
                        updateField(
                          "image_url",
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      Texto do botão
                    </label>

                    <input
                      className="admin-services__input"
                      value={form.cta_text}
                      onChange={(event) =>
                        updateField(
                          "cta_text",
                          event.target.value
                        )
                      }
                      placeholder="Saiba mais"
                    />
                  </div>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      URL do botão
                    </label>

                    <input
                      type="url"
                      className="admin-services__input"
                      value={form.cta_url}
                      onChange={(event) =>
                        updateField(
                          "cta_url",
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  PUBLISH
                  ================================================= */}

              <section className="admin-services__section">
                <h3 className="admin-services__section-title">
                  Publicação
                </h3>

                <div className="admin-services__grid">
                  <label className="admin-services__checkbox">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(event) =>
                        updateField(
                          "published",
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      <span className="admin-services__checkbox-title">
                        Publicado
                      </span>

                      <span className="admin-services__checkbox-description">
                        Exibir este serviço no
                        site público.
                      </span>
                    </span>
                  </label>

                  <label className="admin-services__checkbox">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) =>
                        updateField(
                          "featured",
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      <span className="admin-services__checkbox-title">
                        Destaque
                      </span>

                      <span className="admin-services__checkbox-description">
                        Marcar como serviço
                        destacado.
                      </span>
                    </span>
                  </label>

                  <div className="admin-services__field">
                    <label className="admin-services__label">
                      Ordem
                    </label>

                    <input
                      type="number"
                      className="admin-services__input"
                      value={
                        form.display_order
                      }
                      onChange={(event) =>
                        updateField(
                          "display_order",
                          Number(
                            event.target.value
                          )
                        )
                      }
                      min={0}
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  SEO
                  ================================================= */}

              <section className="admin-services__section">
                <h3 className="admin-services__section-title">
                  SEO
                </h3>

                <div className="admin-services__grid">
                  <div className="admin-services__field admin-services__field--full">
                    <label className="admin-services__label">
                      Título SEO
                    </label>

                    <input
                      className="admin-services__input"
                      value={form.seo_title}
                      onChange={(event) =>
                        updateField(
                          "seo_title",
                          event.target.value
                        )
                      }
                      placeholder="Título para mecanismos de busca..."
                    />
                  </div>

                  <div className="admin-services__field admin-services__field--full">
                    <label className="admin-services__label">
                      Descrição SEO
                    </label>

                    <textarea
                      className="admin-services__textarea"
                      value={
                        form.seo_description
                      }
                      onChange={(event) =>
                        updateField(
                          "seo_description",
                          event.target.value
                        )
                      }
                      placeholder="Descrição para Google e redes sociais..."
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  FOOTER
                  ================================================= */}

              <div className="admin-services__form-footer">
                <button
                  type="button"
                  className="admin-services__button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-services__button admin-services__button--primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={16}
                        className="spin"
                      />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId
                        ? "Salvar alterações"
                        : "Criar serviço"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}