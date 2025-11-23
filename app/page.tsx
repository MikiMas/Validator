"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useGeneration } from "./GenerationContext";
import { supabase } from "@/lib/supabaseClient";

function LandingPublica() {
  return (
    <div className="lp-wrapper">
      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#" className="lp-logo">
            <i className="fas fa-layer-group" />
            <span>Validator</span>
          </a>
          <div className="lp-nav-actions">
            <a href="/login" className="lp-link-muted">
              Iniciar sesión
            </a>
            <a href="/register" className="lp-nav-ta">
              Empezar gratis
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-container">
            <span className="lp-pill">Plataforma de validación para SaaS y productos digitales</span>
            <h1 className="lp-headline">
              Valida tus ideas antes
              <br />
              de invertir meses en desarrollo.
            </h1>
            <p className="lp-subheadline">
              Crea landings y campañas listas para lanzar en minutos y toma decisiones con datos reales, no con intuiciones.
            </p>

            <div className="lp-hero-buttons">
              <a href="/register" className="lp-btn lp-btn-primary">
                Comenzar validación
              </a>
              <a href="#info" className="lp-btn lp-btn-secondary">
                Más información
              </a>
            </div>

            <div className="lp-hero-card">
              <div className="lp-hero-card-header">
                <span>Vista previa del panel</span>
              </div>
              <div className="lp-hero-card-body lp-hero-card-body-single">
                <div>
                  <p className="lp-metric-label">Ejemplo de métricas</p>
                  <p className="lp-metric-value">Visitas, leads y conversión en un solo lugar.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section" id="info">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Pensado para validar, no para complicar.</h2>
              <p className="lp-section-text">
                Un único lugar para generar tu landing, lanzar campañas básicas y ver si una idea merece seguir adelante.
              </p>
            </div>

            <ul className="lp-info-list">
              <li>Describe brevemente tu idea y objetivo.</li>
              <li>Genera una landing y campañas coherentes en pocos minutos.</li>
              <li>Observa resultados simples y decide el siguiente paso.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { status, lastLandingSlug, lastAdId } = useGeneration();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);

  useEffect(() => {
    async function fetchExperiments() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching experiments:", error);
        } else {
          setExperiments(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoadingExperiments(false);
      }
    }

    fetchExperiments();
  }, [user, status]);

  return (
    <div className="dash-page">
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-user-card">
            <div className="dash-user-avatar">
              <i className="fas fa-user" />
            </div>
            <div className="dash-user-info">
              <p className="dash-user-name">Tu cuenta</p>
              <p className="dash-user-email">{user?.email}</p>
            </div>
          </div>

          <nav className="dash-nav">
            <button className="dash-nav-item dash-nav-item-active" type="button">
              <i className="fas fa-columns" />
              <span>Panel de validación</span>
            </button>
            <button
              className="dash-nav-item"
              type="button"
              onClick={() => router.push("/builder")}
            >
              <i className="fas fa-magic" />
              <span>Nuevo experimento</span>
            </button>
            <button className="dash-nav-item" type="button" disabled>
              <i className="fas fa-flask" />
              <span>Experimentos</span>
            </button>
            <button className="dash-nav-item" type="button" disabled>
              <i className="fas fa-chart-line" />
              <span>Métricas</span>
            </button>
            <button className="dash-nav-item" type="button" disabled>
              <i className="fas fa-cog" />
              <span>Configuración</span>
            </button>
          </nav>
        </aside>

        <main className="dash-main">
          <header className="dash-header">
            <div>
              <h1 className="dash-title">Panel de validación</h1>
              <p className="dash-subtitle">
                Crea nuevos experimentos y revisa el estado de tus validaciones.
              </p>
            </div>
            <div className="dash-header-user">
              <div className="dash-header-avatar">JD</div>
              <span className="dash-header-name">User</span>
            </div>
          </header>

          <div className="dash-grid">
            {/* Nuevo experimento */}
            <section className="dash-card dash-card-primary">
              <div className="dash-card-body">
                <h2 className="dash-card-title">Nuevo experimento</h2>
                <p className="dash-card-text">
                  Genera una nueva landing y, si lo deseas, su anuncio asociado en un flujo guiado.
                </p>
              </div>
              <div className="dash-card-footer">
                <button
                  type="button"
                  className="dash-card-button-primary"
                  onClick={() => router.push("/builder")}
                >
                  <i className="fas fa-plus" />
                  Crear experimento
                </button>
              </div>
            </section>

            {/* Estado de experimentos */}
            <section className="dash-card">
              <div className="dash-card-body">
                <h2 className="dash-card-title">Estado de experimentos</h2>

                {status === "processing" && (
                  <p className="dash-card-text" style={{ color: "#2563eb" }}>
                    Generando tu experimento...
                  </p>
                )}

                {status === "error" && (
                  <p className="dash-card-text" style={{ color: "#dc2626" }}>
                    Hubo un error en la generación.
                  </p>
                )}

                {loadingExperiments ? (
                  <p className="dash-card-text">Cargando experimentos...</p>
                ) : experiments.length === 0 ? (
                  <p className="dash-card-text">
                    Aún no has creado ningún experimento.
                  </p>
                ) : (
                  <ul className="dash-card-list">
                    {experiments.map((exp) => (
                      <li key={exp.id} style={{ marginBottom: "1rem" }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <strong>{exp.idea_name}</strong>
                            <br />
                            <span style={{ fontSize: "0.9rem", color: "#666" }}>
                              {new Date(exp.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => router.push(`/experiment/${exp.slug}`)}
                            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded transition-colors"
                          >
                            Ver detalles
                          </button>
                        </div>
                        {exp.slug && (
                          <div style={{ marginTop: "0.25rem" }}>
                            <a href={`/${exp.slug}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontSize: "0.9rem" }}>
                              Ver Landing &rarr;
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!user) {
    return <LandingPublica />;
  }

  return <Dashboard />;
}
