import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Service = {
  id: string;
  title: string;
  name: string | null;
  slug: string;
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
  "Inteligência Artificial",
  "Automação",
  "Sistemas",
  "Consultoria",
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

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadServices = useCallback(async () => {
    clearMessages();
    setLoading(true);

    try {
      if (!supabase) {
        setServices([]);
        setError(
          "Supabase não está configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
        );
        return;
      }

      const { data, error: queryError } = await supabase
        .from("services")
        .select("*")
        .order("display_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        console.error("Erro ao carregar serviços:", queryError);
        setServices([]);
        setError(queryError.message);
        return;
      }

      setServices((data ?? []) as Service[]);
    } catch (err) {
      console.error("Erro inesperado ao carregar serviços:", err);
      setServices([]);
      setError("Não foi possível carregar os serviços.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        service.title?.toLowerCase().includes(normalizedSearch) ||
        service.name?.toLowerCase().includes(normalizedSearch) ||
        service.slug?.toLowerCase().includes(normalizedSearch) ||
        service.category?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "Todas" ||
        service.category === categoryFilter;

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Publicados" && service.published) ||
        (statusFilter === "Rascunhos" && !service.published) ||
        (statusFilter === "Destaques" && service.featured);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, search, categoryFilter, statusFilter]);

  const updateField = <K extends keyof ServiceForm>(
    field: K,
    value: ServiceForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingId ? current.slug : slugify(value),
      seo_title:
        current.seo_title ||
        (value.trim() ? `${value.trim()} | Jonash.dev` : ""),
    }));
  };

  const handleNew = () => {
    clearMessages();
    setEditingId(null);
    setForm({
      ...emptyForm,
      display_order: services.length,
    });
    setModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    clearMessages();

    setEditingId(service.id);

    setForm({
      name: service.name || service.title || "",
      slug: service.slug || "",
      category: service.category || "Tecnologia",
      icon: service.icon || "Code2",
      badge: service.badge || "",
      short_description: service.short_description || "",
      description: service.description || "",
      image_url: service.image_url || "",
      cta_text: service.cta_text || "Saiba mais",
      cta_url: service.cta_url || "",
      published: Boolean(service.published),
      featured: Boolean(service.featured),
      display_order: service.display_order ?? 0,
      seo_title: service.seo_title || "",
      seo_description: service.seo_description || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const validateForm = () => {
    const name = form.name.trim();
    const slug = form.slug.trim();

    if (!name) {
      setError("Informe o nome do serviço.");
      return false;
    }

    if (!slug) {
      setError("Informe o slug do serviço.");
      return false;
    }

    if (!form.short_description.trim()) {
      setError("Informe uma descrição curta.");
      return false;
    }

    if (!form.description.trim()) {
      setError("Informe a descrição completa.");
      return false;
    }

    return true;
  };

  const checkSlugExists = async (slug: string) => {
    if (!supabase) return false;

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
      console.error("Erro ao verificar slug:", queryError);
      return false;
    }

    return Boolean(data?.length);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    clearMessages();

    if (!supabase) {
      setError(
        "Supabase não está configurado. Verifique as variáveis de ambiente."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const normalizedName = form.name.trim();
      const normalizedSlug = slugify(form.slug);

      const slugExists = await checkSlugExists(normalizedSlug);

      if (slugExists) {
        setError(
          `O slug "${normalizedSlug}" já está sendo utilizado por outro serviço.`
        );
        return;
      }

      const payload = {
        // A tabela exige title.
        title: normalizedName,

        // Mantemos name para compatibilidade com o CMS atual.
        name: normalizedName,

        slug: normalizedSlug,
        category: form.category.trim() || "Tecnologia",
        icon: form.icon.trim() || "Code2",
        badge: form.badge.trim() || null,
        short_description:
          form.short_description.trim() || null,
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        cta_text: form.cta_text.trim() || "Saiba mais",
        cta_url: form.cta_url.trim() || null,
        published: Boolean(form.published),
        featured: Boolean(form.featured),
        display_order: Number(form.display_order) || 0,
        seo_title:
          form.seo_title.trim() ||
          `${normalizedName} | Jonash.dev`,
        seo_description:
          form.seo_description.trim() ||
          form.short_description.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          console.error(
            "Erro ao atualizar serviço:",
            updateError
          );

          if (updateError.code === "23505") {
            setError(
              "Já existe um serviço com esse slug."
            );
          } else if (updateError.code === "23502") {
            setError(
              "Um campo obrigatório não foi preenchido."
            );
          } else if (updateError.code === "42501") {
            setError(
              "Você não possui permissão para atualizar serviços."
            );
          } else {
            setError(updateError.message);
          }

          return;
        }

        setSuccess("Serviço atualizado com sucesso.");
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert(payload);

        if (insertError) {
          console.error(
            "Erro ao criar serviço:",
            insertError
          );

          if (insertError.code === "23505") {
            setError(
              "Já existe um serviço com esse slug."
            );
          } else if (insertError.code === "23502") {
            setError(
              "Um campo obrigatório não foi preenchido."
            );
          } else if (insertError.code === "42501") {
            setError(
              "Você não possui permissão para criar serviços."
            );
          } else {
            setError(insertError.message);
          }

          return;
        }

        setSuccess("Serviço criado com sucesso.");
      }

      closeModal();
      await loadServices();
    } catch (err) {
      console.error("Erro inesperado ao salvar:", err);
      setError("Não foi possível salvar o serviço.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    if (!supabase) {
      setError("Supabase não está configurado.");
      return;
    }

    setDeleteLoading(true);
    clearMessages();

    try {
      const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", deleteId);

      if (deleteError) {
        console.error(
          "Erro ao excluir serviço:",
          deleteError
        );

        if (deleteError.code === "42501") {
          setError(
            "Você não possui permissão para excluir serviços."
          );
        } else {
          setError(deleteError.message);
        }

        return;
      }

      setDeleteId(null);
      setSuccess("Serviço excluído com sucesso.");

      await loadServices();
    } catch (err) {
      console.error("Erro inesperado ao excluir:", err);
      setError("Não foi possível excluir o serviço.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePublished = async (service: Service) => {
    if (!supabase) {
      setError("Supabase não está configurado.");
      return;
    }

    clearMessages();

    try {
      const { error: updateError } = await supabase
        .from("services")
        .update({
          published: !service.published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id);

      if (updateError) {
        console.error(
          "Erro ao alterar publicação:",
          updateError
        );
        setError(updateError.message);
        return;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? {
                ...item,
                published: !service.published,
              }
            : item
        )
      );

      setSuccess(
        service.published
          ? "Serviço retirado da publicação."
          : "Serviço publicado com sucesso."
      );
    } catch (err) {
      console.error(err);
      setError("Não foi possível alterar a publicação.");
    }
  };

  const toggleFeatured = async (service: Service) => {
    if (!supabase) {
      setError("Supabase não está configurado.");
      return;
    }

    clearMessages();

    try {
      const { error: updateError } = await supabase
        .from("services")
        .update({
          featured: !service.featured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id);

      if (updateError) {
        console.error(
          "Erro ao alterar destaque:",
          updateError
        );
        setError(updateError.message);
        return;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? {
                ...item,
                featured: !service.featured,
              }
            : item
        )
      );

      setSuccess(
        service.featured
          ? "Serviço removido dos destaques."
          : "Serviço adicionado aos destaques."
      );
    } catch (err) {
      console.error(err);
      setError("Não foi possível alterar o destaque.");
    }
  };

  return (
    <div className="admin-services">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">
            CMS • Serviços
          </span>

          <h1>Serviços</h1>

          <p>
            Gerencie os serviços apresentados no Jonash.dev.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleNew}
        >
          <Plus size={18} />
          Novo serviço
        </button>
      </header>

      {error && (
        <div className="admin-alert admin-alert--error">
          <AlertCircle size={18} />

          <div>
            <strong>Erro</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Fechar erro"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert--success">
          <Check size={18} />

          <div>
            <strong>Sucesso</strong>
            <p>{success}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Fechar mensagem"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="admin-services__toolbar">
        <div className="admin-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Buscar serviços..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="Todas">Todas as categorias</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="Todos">Todos os status</option>
          <option value="Publicados">Publicados</option>
          <option value="Rascunhos">Rascunhos</option>
          <option value="Destaques">Destaques</option>
        </select>
      </section>

      <section className="admin-services__summary">
        <span>
          <strong>{services.length}</strong> serviços cadastrados
        </span>

        <span>
          <strong>
            {services.filter((item) => item.published).length}
          </strong>{" "}
          publicados
        </span>

        <span>
          <strong>
            {services.filter((item) => item.featured).length}
          </strong>{" "}
          destaques
        </span>

        <span>
          <strong>{filteredServices.length}</strong> exibidos
        </span>
      </section>

      <section className="admin-services__content">
        {loading ? (
          <div className="admin-empty-state">
            <Loader2 className="spin" size={30} />

            <h3>Carregando serviços...</h3>

            <p>Aguarde enquanto buscamos os dados.</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="admin-empty-state">
            <AlertCircle size={30} />

            <h3>
              {services.length === 0
                ? "Nenhum serviço cadastrado"
                : "Nenhum resultado encontrado"}
            </h3>

            <p>
              {services.length === 0
                ? "Comece cadastrando o primeiro serviço."
                : "Tente alterar os filtros ou a busca."}
            </p>

            {services.length === 0 && (
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleNew}
              >
                <Plus size={18} />
                Criar primeiro serviço
              </button>
            )}
          </div>
        ) : (
          <div className="admin-services__table-wrapper">
            <table className="admin-services__table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Ordem</th>
                  <th>Atualizado</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="admin-services__service">
                        <div className="admin-services__icon">
                          {service.icon || "⌘"}
                        </div>

                        <div>
                          <strong>
                            {service.title ||
                              service.name ||
                              "Sem título"}
                          </strong>

                          <span>
                            /{service.slug}
                          </span>

                          {service.short_description && (
                            <small>
                              {service.short_description}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-badge">
                        {service.category || "Tecnologia"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-services__status">
                        <button
                          type="button"
                          className={`status-toggle ${
                            service.published
                              ? "is-active"
                              : ""
                          }`}
                          onClick={() =>
                            togglePublished(service)
                          }
                          title={
                            service.published
                              ? "Despublicar"
                              : "Publicar"
                          }
                        >
                          {service.published ? (
                            <>
                              <Eye size={15} />
                              Publicado
                            </>
                          ) : (
                            <>
                              <EyeOff size={15} />
                              Rascunho
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className={`featured-toggle ${
                            service.featured
                              ? "is-active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleFeatured(service)
                          }
                          title={
                            service.featured
                              ? "Remover destaque"
                              : "Destacar"
                          }
                        >
                          <Star size={15} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="order-control">
                        {service.display_order}
                      </div>
                    </td>

                    <td>
                      <span className="admin-services__date">
                        {formatDate(service.updated_at)}
                      </span>
                    </td>

                    <td>
                      <div className="admin-services__actions">
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() =>
                            handleEdit(service)
                          }
                          title="Editar"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          onClick={() =>
                            setDeleteId(service.id)
                          }
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="admin-modal__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="admin-modal admin-modal--large">
            <div className="admin-modal__header">
              <div>
                <span className="admin-page-header__eyebrow">
                  {editingId
                    ? "Editar serviço"
                    : "Novo serviço"}
                </span>

                <h2>
                  {editingId
                    ? "Atualizar serviço"
                    : "Criar serviço"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="admin-modal__close"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-modal__body"
              onSubmit={handleSubmit}
            >
              <div className="admin-form-grid">
                <div className="admin-form-field admin-form-field--full">
                  <label htmlFor="service-name">
                    Nome do serviço *
                  </label>

                  <input
                    id="service-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(event.target.value)
                    }
                    placeholder="Ex.: Desenvolvimento de Sites"
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="service-slug">
                    Slug *
                  </label>

                  <input
                    id="service-slug"
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        slugify(event.target.value)
                      )
                    }
                    placeholder="desenvolvimento-de-sites"
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="service-category">
                    Categoria
                  </label>

                  <select
                    id="service-category"
                    value={form.category}
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value
                      )
                    }
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="service-icon">
                    Ícone
                  </label>

                  <input
                    id="service-icon"
                    type="text"
                    value={form.icon}
                    onChange={(event) =>
                      updateField(
                        "icon",
                        event.target.value
                      )
                    }
                    placeholder="Code2"
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="service-badge">
                    Badge
                  </label>

                  <input
                    id="service-badge"
                    type="text"
                    value={form.badge}
                    onChange={(event) =>
                      updateField(
                        "badge",
                        event.target.value
                      )
                    }
                    placeholder="Popular"
                  />
                </div>

                <div className="admin-form-field admin-form-field--full">
                  <label htmlFor="service-short-description">
                    Descrição curta *
                  </label>

                  <input
                    id="service-short-description"
                    type="text"
                    value={form.short_description}
                    onChange={(event) =>
                      updateField(
                        "short_description",
                        event.target.value
                      )
                    }
                    placeholder="Descrição resumida do serviço"
                    required
                  />
                </div>

                <div className="admin-form-field admin-form-field--full">
                  <label htmlFor="service-description">
                    Descrição completa *
                  </label>

                  <textarea
                    id="service-description"
                    rows={7}
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Explique detalhadamente o serviço..."
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="service-image">
                    URL da imagem
                  </label>

                  <input
                    id="service-image"
                    type="url"
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

                <div className="admin-form-field">
                  <label htmlFor="service-order">
                    Ordem
                  </label>

                  <input
                    id="service-order"
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={(event) =>
                      updateField(
                        "display_order",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="service-cta-text">
                    Texto do botão
                  </label>

                  <input
                    id="service-cta-text"
                    type="text"
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

                <div className="admin-form-field">
                  <label htmlFor="service-cta-url">
                    URL do botão
                  </label>

                  <input
                    id="service-cta-url"
                    type="url"
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

                <div className="admin-form-field admin-form-field--full">
                  <label htmlFor="service-seo-title">
                    SEO Title
                  </label>

                  <input
                    id="service-seo-title"
                    type="text"
                    value={form.seo_title}
                    onChange={(event) =>
                      updateField(
                        "seo_title",
                        event.target.value
                      )
                    }
                    placeholder="Título para mecanismos de busca"
                  />
                </div>

                <div className="admin-form-field admin-form-field--full">
                  <label htmlFor="service-seo-description">
                    SEO Description
                  </label>

                  <textarea
                    id="service-seo-description"
                    rows={4}
                    value={form.seo_description}
                    onChange={(event) =>
                      updateField(
                        "seo_description",
                        event.target.value
                      )
                    }
                    placeholder="Descrição para mecanismos de busca"
                  />
                </div>
              </div>

              <div className="admin-form-options">
                <label className="admin-checkbox">
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
                    <strong>Publicado</strong>
                    <small>
                      Exibir este serviço no site.
                    </small>
                  </span>
                </label>

                <label className="admin-checkbox">
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
                    <strong>Destacado</strong>
                    <small>
                      Marcar como serviço em destaque.
                    </small>
                  </span>
                </label>
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="spin"
                      />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
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

      {deleteId && (
        <div className="admin-modal__overlay">
          <div className="admin-modal admin-modal--small">
            <div className="admin-modal__header">
              <div>
                <span className="admin-page-header__eyebrow">
                  Atenção
                </span>

                <h2>Excluir serviço?</h2>
              </div>

              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="admin-modal__close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal__body">
              <div className="admin-delete-warning">
                <Trash2 size={30} />

                <p>
                  Esta ação excluirá o serviço
                  permanentemente. Essa operação não pode ser
                  desfeita.
                </p>
              </div>
            </div>

            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="admin-btn admin-btn--danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Excluir definitivamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}