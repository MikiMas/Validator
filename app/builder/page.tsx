"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import { useGeneration } from "../GenerationContext";

function MultiStepBuilder() {
  const router = useRouter();
  const { user } = useAuth();
  const { setStatus, setLastLandingSlug, setLastAdId } = useGeneration();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Basic Info
  const [projectName, setProjectName] = useState("");
  const [basicDescription, setBasicDescription] = useState("");
  const [waitlistOffer, setWaitlistOffer] = useState("");

  // Step 2: Ad Info
  const [adHeadline, setAdHeadline] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [adPicture, setAdPicture] = useState("");

  // Step 3: Campaign Settings
  const [campaignDuration, setCampaignDuration] = useState(7);
  const [dailyBudget, setDailyBudget] = useState(5);
  const [estimation, setEstimation] = useState<{
    loading: boolean;
    data: {
      estimatedImpressions: number;
      estimatedClicks: number;
      estimatedCPC: string;
      cpm: number;
      maxCampaignDays: number;
    } | null;
    error: string | null;
  }>({ loading: false, data: null, error: null });

  const totalSteps = 3;
  const progressPercent = (step / totalSteps) * 100;

  if (!user) {
    router.push("/login");
    return null;
  }

  const estimateImpressions = async (budget: number) => {
    if (budget < 1) {
      setEstimation({
        loading: false,
        data: null,
        error: "El presupuesto mínimo es de 1€"
      });
      return;
    }

    setEstimation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/estimateImpressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudget: budget })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al calcular la estimación');
      }

      setEstimation({
        loading: false,
        data: {
          estimatedImpressions: data.estimatedImpressions,
          estimatedClicks: data.estimatedClicks,
          estimatedCPC: data.estimatedCPC,
          cpm: data.cpm,
          maxCampaignDays: data.maxCampaignDays
        },
        error: null
      });
    } catch (error: any) {
      console.error('Error al estimar impresiones:', error);
      setEstimation({
        loading: false,
        data: null,
        error: error.message
      });
    }
  };

  // Efecto para la estimación con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dailyBudget >= 1) {
        estimateImpressions(dailyBudget);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dailyBudget]);

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = (e: FormEvent) => {
    e.preventDefault();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Efecto para la estimación con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dailyBudget >= 1) {
        estimateImpressions(dailyBudget);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dailyBudget]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus("processing");
    setLastLandingSlug(null);
    setLastAdId(null);

    router.push("/");

    try {
      // Generar landing y campaña en un solo endpoint
      const response = await fetch("/api/generateLanding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaName: projectName,
          ideaDescription: basicDescription,
          waitlistOffer,
          userId: user.id,
          // Configuración de campaña
          campaignSettings: {
            durationDays: campaignDuration,
            dailyBudget,
            totalBudget: dailyBudget * campaignDuration
          },
          // Creative del anuncio
          adHeadline,
          adMessage,
          adPicture
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar la landing");
      }

      const data = await response.json();
      const ideaSlug = data?.slug;

      if (ideaSlug) {
        setLastLandingSlug(ideaSlug);
      }

      if (data?.adData?.adId) {
        setLastAdId(data.adData.adId);
      }

      setStatus("completed");
    } catch (error: any) {
      console.error(error);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="builder-page">
      <div className="builder-container">
        <div className="builder-card">
          <div className="builder-header">
            <div className="builder-logo">
              <i className="fas fa-rocket" />
            </div>
            <h1 className="builder-title">Valida tu Startup</h1>
            <p className="builder-subtitle">
              Completa los pasos para generar tu landing simple y el anuncio.
            </p>
          </div>

          <div className="builder-progress-bar">
            <div className="builder-progress" style={{ width: `${progressPercent}%` }} />
          </div>

          <form className="builder-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="builder-form-grid">
                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="projectName">
                    Nombre del Proyecto *
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="projectName"
                      type="text"
                      className="builder-input"
                      placeholder="Ej: EcoTrack"
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-lightbulb" />
                    </span>
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="basicDescription">
                    Descripción básica *
                  </label>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.4rem" }}>
                    Explica en 3-4 frases:
                    qué problema resuelves y para quién,
                    cómo lo solucionas (tu propuesta de valor)
                    y qué hace que tu solución sea diferente o mejor.
                  </p>
                  <div className="builder-input-wrapper">
                    <textarea
                      id="basicDescription"
                      className="builder-textarea"
                      placeholder="Describe brevemente tu idea..."
                      required
                      value={basicDescription}
                      onChange={(e) => setBasicDescription(e.target.value)}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-align-left" />
                    </span>
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="waitlistOffer">
                    Oferta para la Waitlist *
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="waitlistOffer"
                      type="text"
                      className="builder-input"
                      placeholder="Ej: 50% de descuento en el lanzamiento"
                      required
                      value={waitlistOffer}
                      onChange={(e) => setWaitlistOffer(e.target.value)}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-gift" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="builder-form-grid">
                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="adHeadline">
                    Titular del anuncio *
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="adHeadline"
                      type="text"
                      className="builder-input"
                      placeholder="Ej: Descubre EcoTrack"
                      value={adHeadline}
                      onChange={(e) => setAdHeadline(e.target.value)}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-heading" />
                    </span>
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="adMessage">
                    Texto principal (Copy)
                  </label>
                  <div className="builder-input-wrapper">
                    <textarea
                      id="adMessage"
                      className="builder-textarea"
                      placeholder="Texto encima de la imagen..."
                      value={adMessage}
                      onChange={(e) => setAdMessage(e.target.value)}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-align-left" />
                    </span>
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="adPicture">
                    URL Imagen
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="adPicture"
                      type="url"
                      className="builder-input"
                      placeholder="URL de la imagen del anuncio"
                      value={adPicture}
                      onChange={(e) => setAdPicture(e.target.value)}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-image" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="builder-form-grid">
                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="campaignDuration">
                    Duración de la campaña (días) *
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="campaignDuration"
                      type="number"
                      min="1"
                      max={estimation.data?.maxCampaignDays || 90}
                      value={campaignDuration}
                      onChange={(e) => {
                        const value = Math.min(Number(e.target.value), estimation.data?.maxCampaignDays || 90);
                        setCampaignDuration(Math.max(1, value));
                      }}
                      className="builder-input"
                      disabled={estimation.loading}
                      required
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-calendar-days" />
                    </span>
                  </div>
                  <p className="builder-field-hint">
                    Máximo {estimation.data?.maxCampaignDays || 90} días
                  </p>
                </div>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="dailyBudget">
                    Presupuesto diario (€) *
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="dailyBudget"
                      type="number"
                      min="1"
                      step="0.01"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(Number(e.target.value))}
                      className="builder-input"
                      disabled={estimation.loading}
                      required
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-euro-sign" />
                    </span>
                  </div>
                  <p className="builder-field-hint">
                    Mínimo 1€ por día
                  </p>
                </div>

                {/* Sección de estimación */}
                <div className="builder-field builder-field-full">
                  <div className="builder-estimation-card">
                    <h4 className="builder-estimation-title">
                      <i className="fas fa-chart-line" />
                      Estimación de rendimiento
                    </h4>
                    
                    {estimation.loading ? (
                      <div className="builder-estimation-loading">
                        <div className="builder-spinner"></div>
                        <span>Calculando estimación...</span>
                      </div>
                    ) : estimation.error ? (
                      <div className="builder-estimation-error">
                        <i className="fas fa-exclamation-triangle" />
                        {estimation.error}
                      </div>
                    ) : estimation.data ? (
                      <div className="builder-estimation-grid">
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">
                            {Math.round(estimation.data.estimatedImpressions).toLocaleString()}
                          </div>
                          <div className="builder-estimation-label">Impresiones/día</div>
                          <div className="builder-estimation-detail">CPM: {estimation.data.cpm}€</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">
                            {estimation.data.estimatedClicks.toLocaleString()}
                          </div>
                          <div className="builder-estimation-label">Clics estimados/día</div>
                          <div className="builder-estimation-detail">CTR: ~2%</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">
                            {estimation.data.estimatedCPC}€
                          </div>
                          <div className="builder-estimation-label">Coste por clic (CPC)</div>
                          <div className="builder-estimation-detail">Estimado</div>
                        </div>
                      </div>
                    ) : (
                      <div className="builder-estimation-placeholder">
                        <i className="fas fa-info-circle" />
                        Establece un presupuesto para ver las estimaciones
                      </div>
                    )}

                    <div className="builder-estimation-total">
                      <strong>Presupuesto total estimado:</strong>{' '}
                      {(dailyBudget * campaignDuration).toFixed(2)}€ ({campaignDuration} días)
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
              {step > 1 && (
                <button
                  type="button"
                  className="builder-button"
                  onClick={(e) => handleBack(e as any)}
                  disabled={submitting}
                  style={{ background: "#e5e7eb", color: "#111827" }}
                >
                  Volver
                </button>
              )}

              {step < totalSteps && (
                <button
                  type="button"
                  className="builder-button"
                  onClick={(e) => handleNext(e as any)}
                  disabled={submitting}
                >
                  Siguiente paso
                </button>
              )}

              {step === totalSteps && (
                <button type="submit" className="builder-button" disabled={submitting}>
                  <i className="fas fa-magic" />
                  {submitting ? "Generando..." : "Lanzar experimento"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return <MultiStepBuilder />;
}
