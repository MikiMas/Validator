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
            <div className="lp-logo-text">
              <span>MF Proof</span>
              <small>Plataforma de validacion</small>
            </div>
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
            <div className="lp-branding">
              <p className="lp-brand-name">MF Proof</p>
              <p className="lp-brand-subtext">
                Validacion acelerada para ideas SaaS y productos digitales sin perder tiempo.
              </p>
            </div>
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
  const { user, logout, accessToken } = useAuth();
  const { status, lastLandingSlug, lastAdId } = useGeneration();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalWaitlist: 0,
    loading: true
  });
  const [waitlistModal, setWaitlistModal] = useState<{
    isOpen: boolean;
    waitlist: any[];
    experimentName: string;
  }>({
    isOpen: false,
    waitlist: [],
    experimentName: ""
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    experiment: any | null;
  }>({
    isOpen: false,
    experiment: null
  });
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

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
        } else if (data) {
          // Para cada experimento, cargar métricas y waitlist por separado
          const experimentsWithDetails = await Promise.all(
            data.map(async (experiment: any) => {
              console.log("Procesando experimento:", experiment.id, experiment.idea_name);
              
              // Cargar métricas si tiene ad_id
              let metrics: any = null;
              if (experiment.ad_id) {
                try {
                  console.log("Cargando métricas para ad_id:", experiment.ad_id);
                  const res = await fetch(`/api/getAdMetrics?adId=${experiment.ad_id}`, {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
                  });
                  const metricsData = await res.json();
                  console.log("Respuesta métricas:", metricsData);
                  
                  if (metricsData.success && metricsData.data) {
                    // Mapear los campos de Meta a nuestro formato
                    metrics = {
                      views: parseInt(metricsData.data.impressions) || 0,
                      clicks: parseInt(metricsData.data.clicks) || 0,
                      spend: parseFloat(metricsData.data.spend) || 0,
                      reach: parseInt(metricsData.data.reach) || 0,
                      ctr: parseFloat(metricsData.data.ctr) || 0,
                      cpc: parseFloat(metricsData.data.cpc) || 0,
                      frequency: parseFloat(metricsData.data.frequency) || 0,
                      waitlist: 0 // Temporal, se actualizará después de cargar waitlist
                    };
                    console.log("Métricas mapeadas:", metrics);
                  } else {
                    // Si no hay datos de Meta, usar métricas por defecto
                    metrics = {
                      views: 0,
                      clicks: 0,
                      spend: 0,
                      reach: 0,
                      ctr: 0,
                      cpc: 0,
                      frequency: 0,
                      waitlist: 0 // Temporal, se actualizará después
                    };
                    console.log("Usando métricas por defecto (sin datos de Meta)");
                  }
                } catch (err) {
                  console.error("Error fetching metrics for experiment:", experiment.id, err);
                  // Métricas por defecto en caso de error
                  metrics = {
                    views: 0,
                    clicks: 0,
                    spend: 0,
                    reach: 0,
                    ctr: 0,
                    cpc: 0,
                    frequency: 0,
                    waitlist: 0 // Temporal, se actualizará después
                  };
                }
              } else {
                console.log("Experimento sin ad_id, usando métricas por defecto");
                // Métricas por defecto si no hay ad_id
                metrics = {
                  views: 0,
                  clicks: 0,
                  spend: 0,
                  reach: 0,
                  ctr: 0,
                  cpc: 0,
                  frequency: 0,
                  waitlist: 0 // Temporal, se actualizará después
                };
              }

              // Cargar waitlist si tiene slug
              const waitlist: any[] = [];
              if (experiment.slug) {
                try {
                  console.log("Cargando waitlist para slug:", experiment.slug);
                  const { data: waitlistData, error: waitlistError } = await supabase
                    .from("waitlist_entries")
                    .select("email, name, created_at")
                    .eq("slug", experiment.slug)
                    .order("created_at", { ascending: false });

                  console.log("Respuesta waitlist:", { waitlistData, waitlistError });
                  if (!waitlistError && waitlistData) {
                    waitlist.push(...waitlistData);
                    console.log("Waitlist cargada:", waitlist.length, "entradas");
                  }
                } catch (err) {
                  console.error("Error fetching waitlist for experiment:", experiment.id, err);
                }
              } else {
                console.log("Experimento sin slug, omitiendo waitlist");
              }

              // Actualizar waitlist en las métricas después de cargarla
              if (metrics) {
                metrics.waitlist = waitlist.length;
                console.log("Métricas actualizadas con waitlist:", metrics);
              }

              const result = {
                ...experiment,
                metrics: metrics,
                waitlist: waitlist
              };
              console.log("Resultado final para experimento:", result);
              return result;
            })
          );

          setExperiments(experimentsWithDetails);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoadingExperiments(false);
      }
    }

    fetchExperiments();
  }, [user, status, accessToken]);

  const getStatusDisplay = () => {
    switch (status) {
      case "processing":
        return (
          <div className="status-indicator status-processing">
            <div className="builder-spinner"></div>
            <span>Generando tu experimento...</span>
          </div>
        );
      case "error":
        return (
          <div className="status-indicator status-error">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Hubo un error en la generación</span>
          </div>
        );
      case "completed":
        return (
          <div className="status-indicator status-success">
            <i className="fas fa-check-circle"></i>
            <span>¡Experimento creado con éxito!</span>
          </div>
        );
      default:
        return null;
    }
  };

  const openWaitlistModal = (waitlist: any[], experimentName: string) => {
    setWaitlistModal({
      isOpen: true,
      waitlist: waitlist,
      experimentName: experimentName
    });
  };

  const closeWaitlistModal = () => {
    setWaitlistModal({
      isOpen: false,
      waitlist: [],
      experimentName: ""
    });
  };

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    // Podríamos agregar un toast o notificación aquí
  };

  const downloadWaitlistCSV = () => {
    const csvContent = [
      ['Nombre', 'Email', 'Fecha de registro'],
      ...waitlistModal.waitlist.map(entry => [
        entry.name || 'Sin nombre',
        entry.email,
        new Date(entry.created_at).toLocaleDateString('es-ES')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `waitlist_${waitlistModal.experimentName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateAdState = (experiment: any) => {
    const duration = experiment?.campaign_settings?.durationDays || 0;
    const createdAt = experiment?.created_at ? new Date(experiment.created_at) : null;
    const daysSinceStart = createdAt
      ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const daysRemaining = Math.max(0, duration - daysSinceStart);
    const adStillRunning = Boolean(experiment?.ad_id && duration > 0 && daysSinceStart < duration);

    return {
      duration,
      daysSinceStart,
      daysRemaining,
      adStillRunning,
      hasAd: Boolean(experiment?.ad_id)
    };
  };

  const getDeletionMessage = (experiment: any) => {
    if (!experiment) {
      return "Se borrará completamente la landing y ya no se podrá acceder a ella.";
    }

    const { duration, daysRemaining, adStillRunning, hasAd } = calculateAdState(experiment);

    if (adStillRunning) {
      return `El periodo del anuncio (${duration} días) aún no termina (${Math.ceil(daysRemaining)} días restantes) y no se te devolverá el dinero invertido.`;
    }

    if (hasAd) {
      return "El anuncio ya terminó, pero la eliminación sigue siendo irreversible.";
    }

    return "Se borrará completamente la landing y ya no se podrá acceder a ella.";
  };

  const openDeleteModal = (experiment: any) => {
    setDeleteModal({
      isOpen: true,
      experiment
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      experiment: null
    });
  };

  const handleDeleteExperiment = async (experiment: any) => {
    if (!experiment?.id) {
      return false;
    }
    setDeleteLoadingId(experiment.id);

    try {
      const response = await fetch("/api/deleteExperiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ id: experiment.id })
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "No se pudo eliminar el experimento");
      }

      setExperiments(prev => prev.filter(exp => exp.id !== experiment.id));
      alert("Experimento eliminado correctamente.");
      return true;
    } catch (error: any) {
      console.error("Error eliminando experimento:", error);
      alert(error?.message || "No se pudo eliminar el experimento.");
      return false;
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const confirmDeleteExperiment = async () => {
    if (!deleteModal.experiment) return;

    const success = await handleDeleteExperiment(deleteModal.experiment);
    if (success) {
      closeDeleteModal();
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-user-card">
            <div className="dash-user-avatar">
              <i className="fas fa-user" />
            </div>
            <div className="dash-user-info">
              <p className="dash-user-email">{user?.email}</p>
            </div>
            <button 
              className="dash-logout-button"
              type="button"
              onClick={logout}
              title="Cerrar sesión"
            >
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>

          <nav className="dash-nav">
            <button className="dash-nav-item dash-nav-item-active" type="button">
              <i className="fas fa-home" />
              <span>Panel principal</span>
            </button>
            <button
              className="dash-nav-item"
              type="button"
              onClick={() => router.push("/builder")}
            >
              <i className="fas fa-rocket" />
              <span>Nuevo experimento</span>
            </button>
          </nav>
        </aside>

        <main className="dash-main">
          <header className="dash-header">
            <div className="dash-header-top">
              <div className="dash-branding">
                <span className="dash-brand-pill">MF Proof</span>
                <p className="dash-brand-subtext">Plataforma de validacion colaborativa</p>
              </div>
              <div>
                <h1 className="dash-title">Bienvenido de nuevo</h1>
                <p className="dash-subtitle">
                  Crea nuevos experimentos y valida tus ideas con datos reales
                </p>
              </div>
            </div>
            {getStatusDisplay()}
          </header>

          <div className="dash-grid">
            {/* Estado de experimentos */}
            <section className="dash-card">
              <div className="dash-card-body">
                <div className="dash-card-badge">
                  <i className="fas fa-history" style={{ marginRight: "0.5rem" }}></i>
                  <span>Tus proyectos</span>
                </div>
                <h2 className="dash-card-title">Experimentos recientes</h2>
                
                {loadingExperiments ? (
                  <div className="loading-skeleton" style={{ height: "120px", borderRadius: "12px" }}></div>
                ) : experiments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <i className="fas fa-inbox" style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "1rem" }}></i>
                    <p className="dash-card-text">
                      Aún no has creado ningún experimento.
                    </p>
                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                      Tu primer proyecto está a un clic de distancia.
                    </p>
                  </div>
                ) : (
                  <div className="dash-card-list">
                    {experiments.slice(0, 5).map((exp) => (
                      <div key={exp.id} className="experiment-card-expanded">
                        {/* Header del experimento */}
                        <div className="experiment-card-header">
                          <div>
                            <div className="experiment-card-title">{exp.idea_name}</div>
                            <div className="experiment-card-date">
                              <i className="fas fa-calendar" style={{ marginRight: "0.5rem" }}></i>
                              {new Date(exp.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="experiment-card-actions">
                            {exp.slug && (
                              <a 
                                href={`/${exp.slug}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="experiment-card-landing-link-top"
                              >
                                <i className="fas fa-external-link-alt"></i>
                                Ver landing
                              </a>
                            )}
                            <div className="experiment-status">
                              <span className={`status-badge ${exp.ad_id ? 'status-active' : 'status-inactive'}`}>
                                {exp.ad_id ? 'Activo' : 'Solo landing'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="experiment-delete-button"
                              onClick={() => openDeleteModal(exp)}
                              disabled={deleteLoadingId === exp.id}
                            >
                              {deleteLoadingId === exp.id ? "Eliminando..." : "Eliminar experimento"}
                            </button>
                          </div>
                        </div>
                        
                        {/* Métricas principales */}
                        <div className="experiment-metrics">
                          <div className="experiment-metric">
                            <div className="experiment-metric-value">
                              <i className="fas fa-eye" style={{ color: "#1e293b", marginRight: "0.5rem" }}></i>
                              {exp.metrics?.views || 0}
                            </div>
                            <div className="experiment-metric-label">Views</div>
                          </div>
                          <div className="experiment-metric">
                            <div className="experiment-metric-value">
                              <i className="fas fa-mouse-pointer" style={{ color: "#334155", marginRight: "0.5rem" }}></i>
                              {exp.metrics?.clicks || 0}
                            </div>
                            <div className="experiment-metric-label">Clicks</div>
                          </div>
                          <div className="experiment-metric">
                            <div className="experiment-metric-value">
                              <i className="fas fa-envelope" style={{ color: "#16a34a", marginRight: "0.5rem" }}></i>
                              {exp.waitlist?.length || 0}
                            </div>
                            <div className="experiment-metric-label">Waitlist</div>
                            {exp.waitlist && exp.waitlist.length > 0 && (
                              <button 
                                className="waitlist-metric-button"
                                onClick={() => openWaitlistModal(exp.waitlist, exp.idea_name)}
                                title="Ver lista completa"
                              >
                                <i className="fas fa-users"></i>
                              </button>
                            )}
                          </div>
                          <div className="experiment-metric">
                            <div className="experiment-metric-value">
                              <i className="fas fa-dollar-sign" style={{ color: "#f59e0b", marginRight: "0.5rem" }}></i>
                              {exp.metrics?.spend || 0}€
                            </div>
                            <div className="experiment-metric-label">Invertido</div>
                          </div>
                        </div>

                        {/* Sección expandida con detalles */}
                        <div className="experiment-details-section">
                          {/* Espacio para futuras secciones */}
                        </div>
                      </div>
                    ))}
                    {experiments.length > 5 && (
                      <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <button 
                          className="dash-card-button-secondary" 
                          style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                          disabled
                        >
                          Ver todos los experimentos ({experiments.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {deleteModal.isOpen && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3 className="delete-modal-title">
                <i className="fas fa-trash-alt" style={{ marginRight: "0.35rem", color: "#dc2626" }}></i>
                Eliminar experimento
              </h3>
              <p className="delete-modal-description">
                ¿Quieres eliminar "{deleteModal.experiment?.idea_name}"? Esta acción elimina la landing y deja de estar accesible.
              </p>
              <p className="delete-modal-warning">
                {getDeletionMessage(deleteModal.experiment)}
                <strong style={{ display: "block", marginTop: "0.25rem" }}>Esta acción no se puede deshacer.</strong>
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-button delete-modal-button-secondary"
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoadingId === deleteModal.experiment?.id}
              >
                Cancelar
              </button>
              <button
                className="delete-modal-button delete-modal-button-danger"
                type="button"
                onClick={confirmDeleteExperiment}
                disabled={deleteLoadingId === deleteModal.experiment?.id}
              >
                {deleteLoadingId === deleteModal.experiment?.id ? "Eliminando..." : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Waitlist */}
      {waitlistModal.isOpen && (
        <div className="waitlist-modal-overlay" onClick={closeWaitlistModal}>
          <div className="waitlist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="waitlist-modal-header">
              <h3 className="waitlist-modal-title">
                <i className="fas fa-users" style={{ marginRight: "0.5rem", color: "#16a34a" }}></i>
                Lista de espera - {waitlistModal.experimentName}
              </h3>
              <button className="waitlist-modal-close" onClick={closeWaitlistModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="waitlist-modal-actions">
              <button className="waitlist-download-button" onClick={downloadWaitlistCSV}>
                <i className="fas fa-download"></i>
                Descargar CSV
              </button>
            </div>

            <div className="waitlist-modal-content">
              {waitlistModal.waitlist.length > 0 ? (
                <div className="waitlist-table-container">
                  <table className="waitlist-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Fecha de registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlistModal.waitlist.map((entry: any, index: number) => (
                        <tr key={index}>
                          <td className="waitlist-name">{entry.name || "Sin nombre"}</td>
                          <td className="waitlist-email">
                            <button 
                              className="waitlist-email-button"
                              onClick={() => copyEmailToClipboard(entry.email)}
                              title="Copiar email"
                            >
                              <i className="fas fa-copy"></i>
                              {entry.email}
                            </button>
                          </td>
                          <td className="waitlist-date">
                            {new Date(entry.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="waitlist-modal-empty">
                  <i className="fas fa-user-friends" style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "1rem" }}></i>
                  <p>No hay usuarios en la lista de espera</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
