"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "No se ha podido iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-layout">
        {/* Panel izquierdo - Información */}
        <section className="auth-panel auth-panel-info">
          <div>
            <div className="auth-kicker">
              <i className="fas fa-chart-line" />
              <span>Validator</span>
            </div>
            <h1 className="auth-title">Valida tu idea sin escribir una sola línea de código</h1>
            <p className="auth-description">
              Crea landings, lanza anuncios en Meta y entiende en minutos si merece la pena invertir en tu próxima idea.
            </p>

            <div className="auth-bullets">
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Feedback real de usuarios antes de construir el producto.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Métricas claras de conversión de tus campañas.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Ahorra tiempo y recursos validando antes de desarrollar.</p>
              </div>
            </div>
          </div>

          <div className="auth-footer-info">
            <div className="auth-avatars">
              <div className="auth-avatar">A</div>
              <div className="auth-avatar">B</div>
              <div className="auth-avatar">C</div>
            </div>
            <p className="text-sm">+500 emprendedores ya validan con nosotros</p>
          </div>
        </section>

        {/* Panel derecho - Formulario */}
        <section className="auth-panel auth-panel-form">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">V</div>
              <span className="auth-logo-text">Validator</span>
            </div>
          </div>

          <div>
            <h2 className="auth-title-main">Inicia sesión</h2>
            <p className="auth-subtitle">Entra en tu cuenta para seguir validando ideas.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
                <div className="auth-input-icon">
                  <i className="far fa-envelope" />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-row">
                <label>Contraseña</label>
                <a href="/forgot-password" className="auth-link-small">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="auth-input-icon">
                  <i className="far fa-eye-slash" />
                </div>
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-checkbox">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recordarme</label>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button-primary" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta? <a href="/register">Regístrate gratis</a>
          </p>
        </section>
      </main>
    </div>
  );
}