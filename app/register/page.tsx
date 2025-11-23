"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "@/lib/authClient";

export default function RegisterPage() {
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
      await registerWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "No se ha podido registrar el usuario");
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
            <h1 className="auth-title">Crea una cuenta y empieza a validar tus ideas hoy</h1>
            <p className="auth-description">
              Genera landings atractivas y anuncios en Meta en cuestión de minutos. Sin desarrollo, solo resultados.
            </p>

            <div className="auth-bullets">
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Lanza campañas pequeñas para medir interés real.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Aprende qué mensaje conecta mejor con tu audiencia.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Valida antes de invertir tiempo y dinero en desarrollo.</p>
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
            <a href="/login" className="auth-link-inline">
              Iniciar sesión
            </a>
          </div>

          <div>
            <h2 className="auth-title-main">Crear cuenta</h2>
            <p className="auth-subtitle">Comienza a validar tus ideas en menos de un minuto.</p>
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
              <label>Contraseña</label>
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
              <p className="text-xs" style={{ color: "var(--text-light)", marginTop: "0.25rem" }}>
                Mínimo 6 caracteres.
              </p>
            </div>

            <div className="auth-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Acepto los {" "}
                <a href="/terms" className="auth-link-small">
                  términos y condiciones
                </a>
              </label>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button-primary" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>

            <div className="auth-separator">O regístrate con</div>

            <div className="auth-social-grid">
              <button type="button" className="auth-social-button">
                <i className="fab fa-google" />
                Google
              </button>
              <button type="button" className="auth-social-button">
                <i className="fab fa-facebook" />
                Facebook
              </button>
            </div>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
          </p>
        </section>
      </main>
    </div>
  );
}