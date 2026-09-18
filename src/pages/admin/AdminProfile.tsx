import {
  CheckCircle2,
  Eye,
  EyeOff,
  Github,
  ImagePlus,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  User,
  Video,
  Globe,
  BriefcaseBusiness,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  user_id: string | null;
  full_name: string;
  display_name: string;
  role: string;
  headline: string;
  bio: string | null;
  short_bio: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  whatsapp_url: string | null;
  available_for_work: boolean;
  published: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

const DEFAULT_PROFILE: Profile = {
  id: "",
  user_id: null,
  full_name: "Jonas Henrique Rodrigues",
  display_name: "Jonas",
  role: "Desenvolvedor de Sistemas",
  headline: "Tecnologia • IA • Projetos",
  bio: "",
  short_bio: "",
  avatar_url: null,
  avatar_path: null,
  location: "Barretos, SP",
  email: "",
  phone: "",
  website_url: "",
  github_url: "",
  linkedin_url: "",
  instagram_url: "",
  youtube_url: "",
  whatsapp_url: "",
  available_for_work: true,
  published: true,
  display_order: 0,
  seo_title: "",
  seo_description: "",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function normalizeProfile(data: Partial<Profile> | null): Profile {
  return {
    ...DEFAULT_PROFILE,
    ...data,
  };
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "jpeg") return "jpg";

  return extension || "webp";
}

export default function AdminProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("profile")
      .select("*")
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (loadError) {
      console.error("[AdminProfile] Erro ao carregar perfil:", loadError);
      setError(loadError.message);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile(normalizeProfile(data));
    } else {
      setProfile(DEFAULT_PROFILE);
    }

    setLoading(false);
  }

  function updateField<K extends keyof Profile>(
    field: K,
    value: Profile[K],
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        full_name: profile.full_name.trim(),
        display_name: profile.display_name.trim(),
        role: profile.role.trim(),
        headline: profile.headline.trim(),
        bio: profile.bio?.trim() || null,
        short_bio: profile.short_bio?.trim() || null,
        avatar_url: profile.avatar_url,
        avatar_path: profile.avatar_path,
        location: profile.location?.trim() || null,
        email: profile.email?.trim() || null,
        phone: profile.phone?.trim() || null,
        website_url: profile.website_url?.trim() || null,
        github_url: profile.github_url?.trim() || null,
        linkedin_url: profile.linkedin_url?.trim() || null,
        instagram_url: profile.instagram_url?.trim() || null,
        youtube_url: profile.youtube_url?.trim() || null,
        whatsapp_url: profile.whatsapp_url?.trim() || null,
        available_for_work: profile.available_for_work,
        published: profile.published,
        display_order: Number(profile.display_order) || 0,
        seo_title: profile.seo_title?.trim() || null,
        seo_description: profile.seo_description?.trim() || null,
      };

      let data;
      let saveError;

      if (profile.id) {
        const response = await supabase
          .from("profile")
          .update(payload)
          .eq("id", profile.id)
          .select("*")
          .single();

        data = response.data;
        saveError = response.error;
      } else {
        const response = await supabase
          .from("profile")
          .insert(payload)
          .select("*")
          .single();

        data = response.data;
        saveError = response.error;
      }

      if (saveError) {
        throw saveError;
      }

      if (data) {
        setProfile(normalizeProfile(data));
      }

      setMessage("Perfil atualizado com sucesso.");
    } catch (saveError: any) {
      console.error("[AdminProfile] Erro ao salvar:", saveError);

      setError(
        saveError?.message ||
          "Não foi possível salvar as informações do perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Formato inválido. Use JPG, PNG, WebP ou AVIF.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem deve ter no máximo 5 MB.");

      event.target.value = "";
      return;
    }

    const temporaryPreview = URL.createObjectURL(file);

    setPreviewUrl(temporaryPreview);
    setUploading(true);

    try {
      const extension = getFileExtension(file);

      const filePath =
        `avatar/profile-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("profile")
        .getPublicUrl(filePath);

      const newAvatarUrl = publicUrlData.publicUrl;

      const oldAvatarPath = profile.avatar_path;

      let savedProfile: Profile;

      if (profile.id) {
        const { data, error: updateError } = await supabase
          .from("profile")
          .update({
            avatar_url: newAvatarUrl,
            avatar_path: filePath,
          })
          .eq("id", profile.id)
          .select("*")
          .single();

        if (updateError) {
          await supabase.storage
            .from("profile")
            .remove([filePath]);

          throw updateError;
        }

        savedProfile = normalizeProfile(data);
      } else {
        const { data, error: insertError } = await supabase
          .from("profile")
          .insert({
            ...DEFAULT_PROFILE,
            avatar_url: newAvatarUrl,
            avatar_path: filePath,
          })
          .select("*")
          .single();

        if (insertError) {
          await supabase.storage
            .from("profile")
            .remove([filePath]);

          throw insertError;
        }

        savedProfile = normalizeProfile(data);
      }

      setProfile(savedProfile);

      /*
       * Só removemos a imagem antiga depois que:
       * 1. o novo arquivo foi enviado;
       * 2. a URL foi salva no banco.
       */
      if (
        oldAvatarPath &&
        oldAvatarPath !== filePath
      ) {
        await supabase.storage
          .from("profile")
          .remove([oldAvatarPath]);
      }

      setMessage("Foto profissional atualizada com sucesso.");
    } catch (uploadError: any) {
      console.error(
        "[AdminProfile] Erro no upload:",
        uploadError,
      );

      setError(
        uploadError?.message ||
          "Não foi possível enviar a foto.",
      );

      setPreviewUrl(null);
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemovePhoto() {
    if (!profile.avatar_path && !profile.avatar_url) {
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja remover a foto profissional?",
    );

    if (!confirmed) return;

    setRemovingPhoto(true);
    setError("");
    setMessage("");

    try {
      const oldAvatarPath = profile.avatar_path;

      const { data, error: updateError } = await supabase
        .from("profile")
        .update({
          avatar_url: null,
          avatar_path: null,
        })
        .eq("id", profile.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      if (oldAvatarPath) {
        const { error: removeError } =
          await supabase.storage
            .from("profile")
            .remove([oldAvatarPath]);

        if (removeError) {
          console.warn(
            "[AdminProfile] Não foi possível remover o arquivo antigo:",
            removeError,
          );
        }
      }

      setProfile(normalizeProfile(data));
      setPreviewUrl(null);

      setMessage("Foto profissional removida.");
    } catch (removeError: any) {
      console.error(
        "[AdminProfile] Erro ao remover foto:",
        removeError,
      );

      setError(
        removeError?.message ||
          "Não foi possível remover a foto.",
      );
    } finally {
      setRemovingPhoto(false);
    }
  }

  const displayedPhoto =
    previewUrl ||
    profile.avatar_url ||
    null;

  if (loading) {
    return (
      <section className="admin-profile">
        <div className="admin-profile__loading">
          <Loader2 className="spin" size={28} />
          <span>Carregando perfil...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-profile">
      <div className="admin-page-header">
        <div>
          <span className="admin-login-badge">
            <User size={14} />
            Perfil profissional
          </span>

          <h1>Meu Perfil</h1>

          <p>
            Configure as informações profissionais exibidas
            no Jonash.dev.
          </p>
        </div>

        <div className="admin-profile__status">
          <span
            className={
              profile.published
                ? "admin-status admin-status--active"
                : "admin-status"
            }
          >
            {profile.published ? (
              <>
                <Eye size={15} />
                Publicado
              </>
            ) : (
              <>
                <EyeOff size={15} />
                Oculto
              </>
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-alert admin-alert--success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <form
        className="admin-profile__form"
        onSubmit={handleSubmit}
      >
        {/* =====================================================
            FOTO
        ====================================================== */}

        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div>
              <h2>Foto profissional</h2>
              <p>
                Essa imagem será utilizada no perfil e na
                página inicial.
              </p>
            </div>
          </div>

          <div className="admin-profile__photo-area">
            <div className="admin-profile__photo">
              {displayedPhoto ? (
                <img
                  src={displayedPhoto}
                  alt={
                    profile.full_name ||
                    "Foto profissional"
                  }
                />
              ) : (
                <div className="admin-profile__photo-placeholder">
                  <User size={56} />
                </div>
              )}
            </div>

            <div className="admin-profile__photo-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handlePhotoChange}
                hidden
              />

              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="spin"
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ImagePlus size={17} />
                    Escolher foto
                  </>
                )}
              </button>

              {(profile.avatar_url ||
                profile.avatar_path) && (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={handleRemovePhoto}
                  disabled={
                    removingPhoto ||
                    uploading
                  }
                >
                  {removingPhoto ? (
                    <Loader2
                      size={17}
                      className="spin"
                    />
                  ) : (
                    <Trash2 size={17} />
                  )}

                  Remover
                </button>
              )}

              <span className="admin-profile__photo-help">
                JPG, PNG, WebP ou AVIF · máximo 5 MB
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            IDENTIDADE
        ====================================================== */}

        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div>
              <h2>Identidade profissional</h2>
              <p>
                Informações principais exibidas no site.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Nome completo</span>

              <input
                value={profile.full_name}
                onChange={(event) =>
                  updateField(
                    "full_name",
                    event.target.value,
                  )
                }
                placeholder="Jonas Henrique Rodrigues"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Nome de exibição</span>

              <input
                value={profile.display_name}
                onChange={(event) =>
                  updateField(
                    "display_name",
                    event.target.value,
                  )
                }
                placeholder="Jonas"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Cargo / função</span>

              <input
                value={profile.role}
                onChange={(event) =>
                  updateField(
                    "role",
                    event.target.value,
                  )
                }
                placeholder="Desenvolvedor de Sistemas"
              />
            </label>

            <label className="admin-form-field">
              <span>Headline</span>

              <input
                value={profile.headline}
                onChange={(event) =>
                  updateField(
                    "headline",
                    event.target.value,
                  )
                }
                placeholder="Tecnologia • IA • Projetos"
              />
            </label>

            <label className="admin-form-field">
              <span>Localização</span>

              <div className="admin-input-icon">
                <MapPin size={17} />

                <input
                  value={profile.location || ""}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value,
                    )
                  }
                  placeholder="Barretos, SP"
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>E-mail profissional</span>

              <div className="admin-input-icon">
                <Mail size={17} />

                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="contato@jonash.dev"
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>Telefone</span>

              <div className="admin-input-icon">
                <Phone size={17} />

                <input
                  value={profile.phone || ""}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value,
                    )
                  }
                  placeholder="(17) 00000-0000"
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>Website</span>

              <div className="admin-input-icon">
                <Globe size={17} />

                <input
                  type="url"
                  value={profile.website_url || ""}
                  onChange={(event) =>
                    updateField(
                      "website_url",
                      event.target.value,
                    )
                  }
                  placeholder="https://jonash.dev"
                />
              </div>
            </label>
          </div>
        </div>

        {/* =====================================================
            BIO
        ====================================================== */}

        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div>
              <h2>Sobre você</h2>
              <p>
                Textos utilizados no perfil profissional.
              </p>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--single">
            <label className="admin-form-field">
              <span>Resumo curto</span>

              <textarea
                rows={3}
                value={profile.short_bio || ""}
                onChange={(event) =>
                  updateField(
                    "short_bio",
                    event.target.value,
                  )
                }
                placeholder="Desenvolvedor focado em tecnologia, IA e criação de soluções digitais."
              />
            </label>

            <label className="admin-form-field">
              <span>Biografia completa</span>

              <textarea
                rows={7}
                value={profile.bio || ""}
                onChange={(event) =>
                  updateField(
                    "bio",
                    event.target.value,
                  )
                }
                placeholder="Conte um pouco sobre sua experiência, projetos, tecnologia e objetivos."
              />
            </label>
          </div>
        </div>

        {/* =====================================================
            REDES
        ====================================================== */}

        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div>
              <h2>Redes e contatos</h2>
              <p>
                Links utilizados nos botões sociais do site.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>GitHub</span>

              <div className="admin-input-icon">
                <Github size={17} />

                <input
                  type="url"
                  value={profile.github_url || ""}
                  onChange={(event) =>
                    updateField(
                      "github_url",
                      event.target.value,
                    )
                  }
                  placeholder="https://github.com/..."
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>LinkedIn</span>

              <div className="admin-input-icon">
                <Linkedin size={17} />

                <input
                  type="url"
                  value={profile.linkedin_url || ""}
                  onChange={(event) =>
                    updateField(
                      "linkedin_url",
                      event.target.value,
                    )
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>Instagram</span>

              <div className="admin-input-icon">
                <Instagram size={17} />

                <input
                  type="url"
                  value={profile.instagram_url || ""}
                  onChange={(event) =>
                    updateField(
                      "instagram_url",
                      event.target.value,
                    )
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>YouTube</span>

              <div className="admin-input-icon">
                <Video size={17} />

                <input
                  type="url"
                  value={profile.youtube_url || ""}
                  onChange={(event) =>
                    updateField(
                      "youtube_url",
                      event.target.value,
                    )
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>WhatsApp</span>

              <div className="admin-input-icon">
                <Phone size={17} />

                <input
                  type="url"
                  value={profile.whatsapp_url || ""}
                  onChange={(event) =>
                    updateField(
                      "whatsapp_url",
                      event.target.value,
                    )
                  }
                  placeholder="https://wa.me/..."
                />
              </div>
            </label>
          </div>
        </div>

        {/* =====================================================
            STATUS
        ====================================================== */}

        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div>
              <h2>Publicação</h2>
              <p>
                Controle como o perfil aparece no site.
              </p>
            </div>
          </div>

          <div className="admin-profile__options">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={profile.published}
                onChange={(event) =>
                  updateField(
                    "published",
                    event.target.checked,
                  )
                }
              />

              <span>
                <strong>Publicar perfil</strong>
                <small>
                  Exibe seu perfil profissional na Home.
                </small>
              </span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={profile.available_for_work}
                onChange={(event) =>
                  updateField(
                    "available_for_work",
                    event.target.checked,
                  )
                }
              />

              <span>
                <strong>
                  Disponível para oportunidades
                </strong>

                <small>
                  Pode exibir um indicador de disponibilidade.
                </small>
              </span>
            </label>
          </div>
        </div>

        {/* =====================================================
            SEO
        ====================================================== */}

        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div>
              <h2>SEO</h2>
              <p>
                Informações utilizadas para mecanismos de busca.
              </p>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--single">
            <label className="admin-form-field">
              <span>Título SEO</span>

              <input
                value={profile.seo_title || ""}
                onChange={(event) =>
                  updateField(
                    "seo_title",
                    event.target.value,
                  )
                }
                placeholder="Jonas Henrique Rodrigues | Jonash.dev"
              />
            </label>

            <label className="admin-form-field">
              <span>Descrição SEO</span>

              <textarea
                rows={4}
                value={profile.seo_description || ""}
                onChange={(event) =>
                  updateField(
                    "seo_description",
                    event.target.value,
                  )
                }
                placeholder="Desenvolvedor de Sistemas especializado em tecnologia, IA e projetos digitais."
              />
            </label>
          </div>
        </div>

        {/* =====================================================
            SAVE
        ====================================================== */}

        <div className="admin-profile__actions">
          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--large"
            disabled={saving || uploading}
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
                <Save size={18} />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}