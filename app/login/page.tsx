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
      setError(err?.message ?? "Unable to log in");
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
            <h1 className="auth-title">Validate your idea without writing a single line of code</h1>
            <p className="auth-description">
              Build landing pages, launch Meta ads, and understand within minutes if your next idea is worth pursuing.
            </p>

            <div className="auth-bullets">
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Get real user feedback before building the product.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>See clear campaign conversion metrics.</p>
              </div>
              <div className="auth-bullet">
                <span className="auth-bullet-icon">
                  <i className="fas fa-check" />
                </span>
                <p>Save time and resources by validating before developing.</p>
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
            <h2 className="auth-title-main">Log in</h2>
            <p className="auth-subtitle">Sign in to keep validating ideas.</p>
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
                <label>Password</label>
                <a href="/forgot-password" className="auth-link-small">
                  Forgot your password?
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
                <label htmlFor="remember">Remember me</label>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button-primary" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>

          </form>

          <p className="auth-footer-text">
            Don't have an account? <a href="/register">Sign up for free</a>
          </p>
        </section>
      </main>
    </div>
  );
}
