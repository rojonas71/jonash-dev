import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (mounted) {
            setError(
              "Supabase não está configurado. Verifique as variáveis de ambiente."
            );
          }
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "[AdminLogin] Erro ao verificar sessão:",
            sessionError
          );
          return;
        }

        if (session && mounted) {
          navigate("/admin", { replace: true });
        }
      } catch (err) {
        console.error("[AdminLogin] Erro ao verificar sessão:", err);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Digite seu e-mail.");
      return;
    }

    if (!password) {
      setError("Digite sua senha.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        "Supabase não está configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (loginError) {
        console.error("[AdminLogin] Supabase Auth:", loginError);

        const message = loginError.message.toLowerCase();

        if (
          message.includes("invalid login credentials") ||
          message.includes("invalid credentials")
        ) {
          setError("E-mail ou senha incorretos.");
        } else if (message.includes("email not confirmed")) {
          setError(
            "Seu e-mail ainda não foi confirmado no Supabase Authentication."
          );
        } else {
          setError(loginError.message);
        }

        return;
      }

      if (!data.session || !data.user) {
        setError(
          "Login realizado, mas nenhuma sessão foi criada. Tente novamente."
        );
        return;
      }

      setSuccess("Login realizado com sucesso. Abrindo Dashboard...");

      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 400);
    } catch (err) {
      console.error("[AdminLogin] Erro inesperado:", err);

      setError(
        "Falha ao conectar ao servidor. Verifique sua internet e a configuração do Supabase."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-loading">
          <Loader2 className="spin" size={32} />
          <span>Verificando sessão...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-background" />

      <section className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck size={32} />
          </div>

          <span className="admin-login-badge">
            Área administrativa
          </span>

          <h1>Dashboard</h1>

          <p>
            Acesso administrativo privado.
          </p>
        </div>

        {error && (
          <div className="admin-login-alert admin-login-alert--error">
            <AlertCircle size={20} />

            <div>
              <strong>Não foi possível entrar</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="admin-login-alert admin-login-alert--success">
            <ShieldCheck size={20} />

            <div>
              <strong>Sucesso</strong>
              <span>{success}</span>
            </div>
          </div>
        )}

        <form
          className="admin-login-form"
          onSubmit={handleLogin}
          noValidate
        >
          <div className="admin-login-field">
            <label htmlFor="admin-email">
              E-mail
            </label>

            <div className="admin-login-input-wrapper">
              <Mail size={19} />

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">
              Senha
            </label>

            <div className="admin-login-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={20} />
                Entrando...
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>Jonash.dev</span>
          <span>•</span>
          <span>Tecnologia • IA • Projetos</span>
        </div>
      </section>
    </main>
  );
}