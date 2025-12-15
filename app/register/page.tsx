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
      setError(err?.message ?? "Unable to register the user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-layout">
      {/* Left panel - Information */}
        <section className="auth-panel auth-panel-info">
          <div>
            <div className="auth-kicker">
              <i className="fas fa-chart-line" />
              <span>Validator</span>
            </div>
            <h1 className="auth-title">Create an account and start validating your ideas today</h1>
            <p className="auth-description">
              Generate attractive landing pages and Meta ads in minutes. No engineering, just results.
            </p>

            <div className="auth-bullets">
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Launch small campaigns to measure real interest.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Learn which message connects best with your audience.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Validate before investing time and money into development.</p>
              </div>
            </div>
          </div>

          <div className="auth-footer-info">
            <div className="auth-avatars">
              <div className="auth-avatar">A</div>
              <div className="auth-avatar">B</div>
              <div className="auth-avatar">C</div>
            </div>
            <p className="text-sm">+500 founders already validate with us</p>
          </div>
        </section>

      {/* Right panel - Form */}
        <section className="auth-panel auth-panel-form">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">V</div>
              <span className="auth-logo-text">Validator</span>
            </div>
          </div>

          <div>
            <h2 className="auth-title-main">Create account</h2>
            <p className="auth-subtitle">Start validating ideas in under a minute.</p>
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
              <label>Password</label>
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
                Minimum 6 characters.
              </p>
            </div>

            <div className="auth-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I accept the {" "}
                <a href="/terms" className="auth-link-small">
                  terms and conditions
                </a>
              </label>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button-primary" disabled={loading}>
              {loading ? "Creating account..." : "Create account for free"}
            </button>

          </form>

          <p className="auth-footer-text">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </section>
      </main>
    </div>
  );
}
