"use client";

import { FormEvent, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import { useGeneration } from "../GenerationContext";

type StepKey =
  | "select-type"
  | "basic-info"
  | "landing-content"
  | "landing-summary"
  | "ads-config"
  | "ad-creation"
  | "combo-summary";

const LANDING_STEPS: StepKey[] = ["select-type", "basic-info", "landing-content", "landing-summary"];
const COMBO_STEPS: StepKey[] = [
  "select-type",
  "basic-info",
  "landing-content",
  "ads-config",
  "ad-creation",
  "combo-summary",
];

function MultiStepBuilder() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const { setStatus, setLastLandingSlug, setLastAdId } = useGeneration();

  const [step, setStep] = useState<number>(0); // Step 0 = Selección de tipo
  const [submitting, setSubmitting] = useState(false);
  const [projectType, setProjectType] = useState<"landing-only" | "combo" | null>(null);

  // Estados para contenido de landing escrito por usuario
  const [landingTitle, setLandingTitle] = useState("");
  const [landingDescription, setLandingDescription] = useState("");
  const [landingWaitlistText, setLandingWaitlistText] = useState("");
  const [landingOfferText, setLandingOfferText] = useState("");
  const [hasLandingOffer, setHasLandingOffer] = useState(false);

  // Estado para identificación interna del proyecto
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");

  // Estado para validación de IA (solo verifica contenido apropiado)
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Step 2: Configuración de Ads (solo para combo)
  const [dailyBudget, setDailyBudget] = useState(10);
  const [campaignDuration, setCampaignDuration] = useState(7);
  const [adHeadline, setAdHeadline] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [adPicture, setAdPicture] = useState("");
  const [wantsAdPicture, setWantsAdPicture] = useState(false);

  // Validación de Ads
  const [adValidationLoading, setAdValidationLoading] = useState(false);
  const [adValidationError, setAdValidationError] = useState<string | null>(null);
  const [adValidationPassed, setAdValidationPassed] = useState(false);

  // Estimación de impresiones
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

  const totalSteps = projectType === "landing-only" ? 3 : 5;
  const progressPercent = ((step + 1) / totalSteps) * 100;

  if (!user) {
    router.push("/login");
    return null;
  }

  const estimateImpressions = useCallback(async (budget: number) => {
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
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
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
  }, [accessToken]);

  // Función para validar contenido de landing con IA (solo verifica apropiado)
  const validateLandingContent = async () => {
    if (!projectName.trim()) {
      setValidationError("Por favor, completa el nombre del proyecto");
      return false;
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!projectSlug.trim() || !slugPattern.test(projectSlug)) {
      setValidationError("Elige una URL válida (solo minúsculas, números y guiones)");
      return false;
    }

    if (!landingTitle.trim() || !landingDescription.trim()) {
      setValidationError("Por favor, completa el título y la descripción principal");
      return false;
    }

    setValidationLoading(true);
    setValidationError(null);
    setValidationWarnings([]);

    try {
      const response = await fetch('/api/validateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          title: landingTitle,
          description: landingDescription,
          waitlistText: landingWaitlistText,
          offerText: hasLandingOffer ? landingOfferText : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar el contenido');
      }

      if (data.valid) {
        setValidationPassed(true);
        if (data.warnings && data.warnings.length > 0) {
          setValidationWarnings(data.warnings);
        }
        return true;
      } else {
        setValidationError(data.reason || 'El contenido no es apropiado');
        return false;
      }
    } catch (error: any) {
      console.error('Error en validación de contenido:', error);
      setValidationError('Error al validar el contenido. Por favor, inténtalo de nuevo.');
      return false;
    } finally {
      setValidationLoading(false);
    }
  };

  // Autogenerar slug desde el nombre si el usuario aún no lo tocó
  useEffect(() => {
    if (!projectSlug.trim() && projectName.trim()) {
      const auto = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setProjectSlug(auto);
    }
  }, [projectName, projectSlug]);

  // Validación de contenido de anuncio con IA
  const validateAdContent = async () => {
    if (!adHeadline.trim() || !adMessage.trim()) {
      setAdValidationError("Por favor, completa el título y el mensaje del anuncio");
      return false;
    }

    setAdValidationLoading(true);
    setAdValidationError(null);

    try {
      const response = await fetch('/api/validateAdContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          adHeadline,
          adMessage,
          adPicture: wantsAdPicture ? adPicture : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar el anuncio');
      }

      if (data.valid) {
        setAdValidationPassed(true);
        return true;
      } else {
        setAdValidationError(data.reason || 'El contenido del anuncio no es apropiado');
        return false;
      }
    } catch (error: any) {
      console.error('Error en validación de anuncio:', error);
      setAdValidationError('Error al validar el anuncio. Por favor, inténtalo de nuevo.');
      return false;
    } finally {
      setAdValidationLoading(false);
    }
  };

  // Navegación entre steps
  const nextStep = async () => {
    if (step === 0 && !projectType) return;

    // Validación del contenido de landing (primer paso después de seleccionar tipo)
    if ((projectType === 'landing-only' && step === 1) ||
      (projectType === 'combo' && step === 1)) {
      const isValid = await validateLandingContent();
      if (!isValid) return;
    }

    // Validación del anuncio (solo combo)
    if (projectType === "combo" && step === 3) {
      const isValid = await validateAdContent();
      if (!isValid) return;
    }

    // Resetear validaciones al cambiar de paso
    setValidationError(null);
    setAdValidationError(null);

    // Solo avanzar si no estamos en el último paso
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };


  // Efecto para la estimación con debounce
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (dailyBudget >= 1 && isMounted) {
        estimateImpressions(dailyBudget);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [dailyBudget, estimateImpressions]);

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handleBack = (e: FormEvent) => {
    e.preventDefault();
    prevStep();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus("processing");
    setLastLandingSlug(null);
    setLastAdId(null);

    try {
      // Generar landing y campaña en un solo endpoint
      const response = await fetch("/api/generateLanding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          mode: projectType || "landing-only",
          ideaName: projectName,
          ideaDescription: landingDescription,
          waitlistOffer: hasLandingOffer ? landingOfferText : "",
          landingTitle,
          landingWaitlistText,
          customSlug: projectSlug,
          // Add campaign settings and ad content only for combo
          ...(projectType === "combo" && {
            campaignSettings: {
              durationDays: campaignDuration,
              dailyBudget: dailyBudget,
              totalBudget: dailyBudget * campaignDuration
            },
            adHeadline,
            adMessage,
            adPicture: wantsAdPicture ? adPicture : null
          })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el proyecto");
      }

      const data = await response.json();
      const ideaSlug = data?.slug;

      if (ideaSlug) {
        setLastLandingSlug(ideaSlug);
        if (projectType === "combo") {
          setLastAdId(data?.adData?.adId);
        }
        setStatus("completed");
        // Redirect after successful creation
        router.push("/");
      }
    } catch (error: any) {
      console.error('Error al crear proyecto:', error);
      setStatus("error");
      // Show error message to user
      setValidationError(error.message || "Error al procesar la solicitud. Por favor, inténtalo de nuevo.");
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
              Describe tu proyecto y deja que la IA cree todo el contenido por ti.
            </p>
          </div>

          <div className="builder-progress-bar">
            <div className="builder-progress" style={{ width: `${progressPercent}%` }} />
          </div>

          <form className="builder-form" onSubmit={handleSubmit}>
            {/* Step 0: Selección de Tipo de Proyecto */}
            {step === 0 && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                  ¿Qué tipo de proyecto quieres crear?
                </div>
                <p className="builder-field-hint">
                  Elige la opción que mejor se adapte a tus necesidades. Puedes añadir anuncios más tarde si lo prefieres.
                </p>

                <div className="builder-field builder-field-full">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "1rem" }}>
                    {/* Opción 1: Solo Landing */}
                    <div
                      className={`builder-estimation-card ${projectType === "landing-only" ? "selected" : ""}`}
                      style={{
                        cursor: "pointer",
                        border: projectType === "landing-only" ? "2px solid #1e293b" : "1px solid #e2e8f0",
                        background: projectType === "landing-only" ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" : "white",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => setProjectType("landing-only")}
                    >
                      <div className="builder-estimation-title" style={{ color: "#1e293b" }}>
                        <i className="fas fa-laptop-house" style={{ marginRight: "0.5rem" }}></i>
                        Solo Landing Page
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "1rem" }}>
                        Crea una landing page profesional para validar tu idea. Perfecto para empezar y testear tu concepto.
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          ✅ Landing page generada por IA
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          ✅ Waitlist con ofertas opcionales
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          ✅ Contenido validado y seguro
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          ➕ Añade anuncios más tarde
                        </div>
                      </div>
                      <div style={{ marginTop: "1rem", fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                        €19
                      </div>
                    </div>

                    {/* Opción 2: Combo Landing + Ads */}
                    <div
                      className={`builder-estimation-card ${projectType === "combo" ? "selected" : ""}`}
                      style={{
                        cursor: "pointer",
                        border: projectType === "combo" ? "2px solid #1e293b" : "1px solid #e2e8f0",
                        background: projectType === "combo" ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" : "white",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => setProjectType("combo")}
                    >
                      <div className="builder-estimation-title" style={{ color: "#1e293b" }}>
                        <i className="fas fa-bullhorn" style={{ marginRight: "0.5rem" }}></i>
                        Combo Landing + Anuncios
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "1rem" }}>
                        Todo en uno: landing page + campaña de anuncios. Ahorra tiempo y lanza más rápido.
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          ✅ Todo lo de la landing page
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          ✅ Campaña de anuncios completa
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          ✅ Anuncios personalizados por ti
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#dc2626" }}>
                          🔥 Ahorra 15% vs comprar por separado
                        </div>
                      </div>
                      <div style={{ marginTop: "1rem", fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>
                        €49 <span style={{ fontSize: "0.8rem", color: "#6b7280", textDecoration: "line-through" }}>€59</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="builder-field-hint" style={{ marginTop: "1.5rem" }}>
                  <i className="fas fa-info-circle" style={{ marginRight: "0.5rem" }}></i>
                  Puedes añadir anuncios a tu landing page más tarde desde el dashboard si lo necesitas.
                </div>
              </div>
            )}

            {/* Step 1: Contenido de Landing con Preview */}
            {step === 1 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
                  {/* Panel de Edición */}
                  <div>
                    <div className="builder-section-title">
                      <i className="fas fa-edit" style={{ marginRight: "0.5rem" }}></i>
                      Escribe el Contenido de tu Landing
                    </div>
                    <p className="builder-field-hint">
                      Escribe exactamente lo que quieres que aparezca en tu landing. Tú tienes el control total.
                    </p>

                    <div className="builder-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="landingTitle">
                          <i className="fas fa-heading" style={{ marginRight: "0.5rem" }}></i>
                          Título Principal *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="landingTitle"
                            type="text"
                            className="builder-input"
                            placeholder="Ej: La revolucionaria app que cambia todo"
                            required
                            value={landingTitle}
                            onChange={(e) => setLandingTitle(e.target.value)}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-heading" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          El título principal que verán los visitantes.
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="landingDescription">
                          <i className="fas fa-align-left" style={{ marginRight: "0.5rem" }}></i>
                          Descripción Principal *
                        </label>
                        <div className="builder-input-wrapper">
                          <textarea
                            id="landingDescription"
                            className="builder-textarea"
                            placeholder="Describe tu producto o servicio de forma clara y atractiva..."
                            required
                            value={landingDescription}
                            onChange={(e) => setLandingDescription(e.target.value)}
                            rows={6}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-align-left" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          Explica qué ofreces, para quién es y por qué es especial.
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="landingWaitlistText">
                          <i className="fas fa-users" style={{ marginRight: "0.5rem" }}></i>
                          Texto de Waitlist *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="landingWaitlistText"
                            type="text"
                            className="builder-input"
                            placeholder="Ej: Únete a la lista de espera y sé el primero en probarlo"
                            required
                            value={landingWaitlistText}
                            onChange={(e) => setLandingWaitlistText(e.target.value)}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-users" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          El texto que motivará a los usuarios a registrarse.
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <div className="switch-container">
                          <span className="switch-label">
                            <i className="fas fa-gift" style={{ marginRight: "0.5rem" }}></i>
                            ¿Quieres incluir una oferta especial?
                          </span>
                          <button
                            type="button"
                            className={`switch ${hasLandingOffer ? 'active' : ''}`}
                            onClick={() => setHasLandingOffer(!hasLandingOffer)}
                            aria-label="Toggle landing offer"
                          />
                        </div>
                      </div>

                      {hasLandingOffer && (
                        <div className="builder-field builder-field-full">
                          <label className="builder-label" htmlFor="landingOfferText">
                            <i className="fas fa-tag" style={{ marginRight: "0.5rem" }}></i>
                            Texto de la Oferta *
                          </label>
                          <div className="builder-input-wrapper">
                            <input
                              id="landingOfferText"
                              type="text"
                              className="builder-input"
                              placeholder="Ej: 20% de descuento en el lanzamiento, acceso anticipado..."
                              required
                              value={landingOfferText}
                              onChange={(e) => setLandingOfferText(e.target.value)}
                            />
                            <span className="builder-input-icon">
                              <i className="fas fa-gift" />
                            </span>
                          </div>
                          <div className="builder-field-hint">
                            Describe la oferta especial para los primeros usuarios.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel de Preview */}
                  <div>
                    <div className="builder-section-title">
                      <i className="fas fa-eye" style={{ marginRight: "0.5rem" }}></i>
                      Preview de tu Landing
                    </div>
                    <p className="builder-field-hint">
                      Así se verá tu landing page en tiempo real.
                    </p>

                    <div style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "2rem",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      minHeight: "400px"
                    }}>
                      {/* Preview del título */}
                      <h1 style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "#1e293b",
                        marginBottom: "1rem",
                        textAlign: "center"
                      }}>
                        {landingTitle || "Tu título aparecerá aquí"}
                      </h1>

                      {/* Preview de la descripción */}
                      <p style={{
                        fontSize: "1.1rem",
                        color: "#374151",
                        lineHeight: "1.6",
                        marginBottom: "2rem",
                        textAlign: "center"
                      }}>
                        {landingDescription || "Tu descripción aparecerá aquí..."}
                      </p>

                      {/* Preview de la waitlist */}
                      <div style={{
                        background: "var(--surface)",
                        borderRadius: "var(--radius)",
                        padding: "2.5rem 2rem",
                        border: "1px solid #e5e7eb",
                        boxShadow: "var(--shadow)"
                      }}>
                        <div style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 2rem",
                          color: "white",
                          fontSize: "1.75rem"
                        }}>
                          <i className="fas fa-users" />
                        </div>

                        <h2 style={{
                          fontSize: "2rem",
                          fontWeight: "700",
                          color: "var(--text-dark)",
                          marginBottom: "1rem",
                          textAlign: "center",
                          lineHeight: "1.2"
                        }}>
                          {landingWaitlistText || "Texto de waitlist"}
                        </h2>

                        <p style={{
                          color: "var(--text-light)",
                          marginBottom: "2rem",
                          textAlign: "center",
                          fontSize: "1.125rem",
                          lineHeight: "1.6"
                        }}>
                          Sé el primero en acceder cuando lancemos. Obtén acceso anticipado y beneficios exclusivos.
                        </p>

                        <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              color: "var(--text-dark)",
                              display: "block",
                              marginBottom: "0.35rem"
                            }}>
                              Nombre completo
                            </label>
                            <input
                              type="text"
                              placeholder="Tu nombre"
                              disabled
                              style={{
                                width: "100%",
                                padding: "0.85rem 1rem",
                                borderRadius: "var(--radius)",
                                border: "2px solid #e5e7eb",
                                fontSize: "0.95rem",
                                background: "var(--surface)",
                                color: "var(--text-dark)"
                              }}
                            />
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              color: "var(--text-dark)",
                              display: "block",
                              marginBottom: "0.35rem"
                            }}>
                              Correo electrónico
                            </label>
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              disabled
                              style={{
                                width: "100%",
                                padding: "0.85rem 1rem",
                                borderRadius: "var(--radius)",
                                border: "2px solid #e5e7eb",
                                fontSize: "0.95rem",
                                background: "var(--surface)",
                                color: "var(--text-dark)"
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={(event) => event.preventDefault()}
                            style={{
                              width: "100%",
                              background: "var(--primary)",
                              color: "white",
                              border: "none",
                              borderRadius: "var(--radius)",
                              padding: "1rem 2rem",
                              fontSize: "1.125rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.75rem",
                              textDecoration: "none",
                              transition: "var(--transition)"
                            }}
                          >
                            <i className="fas fa-paper-plane" />
                            Unirme a la lista
                          </button>
                        </form>

                        {hasLandingOffer && landingOfferText && (
                          <div style={{
                            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                            color: "var(--accent)",
                            padding: "1rem",
                            borderRadius: "var(--radius)",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            marginTop: "1.5rem"
                          }}>
                            🎁 {landingOfferText}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="builder-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="projectName">
                          <i className="fas fa-tag" style={{ marginRight: "0.5rem" }}></i>
                          Nombre del Proyecto *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="projectName"
                            type="text"
                            className="builder-input"
                            placeholder="Ej: MiApp Startup"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-lightbulb" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          Solo lo verás tú en el panel.
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="projectSlug">
                          <i className="fas fa-link" style={{ marginRight: "0.5rem" }}></i>
                          URL personalizada *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="projectSlug"
                            type="text"
                            className="builder-input"
                            placeholder="ej: mi-landing"
                            required
                            value={projectSlug}
                            onChange={(e) => {
                              const sanitized = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "")
                                .replace(/-{2,}/g, "-")
                                .replace(/^-+|-+$/g, "");
                              setProjectSlug(sanitized);
                            }}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-globe" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          Tu landing estará en: <strong>vakant.es/{projectSlug || "tu-url"}</strong> (solo minúsculas, números y guiones).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validación de Contenido */}
                {(validationLoading || validationError || validationPassed || validationWarnings.length > 0) && (
                  <div style={{ gridColumn: "1 / -1", marginTop: "2rem" }}>
                    <div className="builder-estimation-card" style={{
                      background: validationPassed
                        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                        : validationError
                          ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: validationPassed
                        ? '1px solid #bbf7d0'
                        : validationError
                          ? '1px solid #fecaca'
                          : '1px solid #e2e8f0'
                    }}>
                      <div className="builder-estimation-title" style={{
                        color: validationPassed ? '#16a34a' : validationError ? '#dc2626' : '#1e293b'
                      }}>
                        {validationLoading && (
                          <>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: "0.5rem" }}></i>
                            Validando contenido con IA...
                          </>
                        )}
                        {validationPassed && (
                          <>
                            <i className="fas fa-check-circle" style={{ marginRight: "0.5rem" }}></i>
                            Contenido aprobado
                          </>
                        )}
                        {validationError && (
                          <>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.5rem" }}></i>
                            Validación requerida
                          </>
                        )}
                      </div>

                      {validationLoading && (
                        <div className="builder-estimation-loading">
                          <div className="builder-spinner"></div>
                          Analizando si el contenido es apropiado y cumple con las políticas...
                        </div>
                      )}

                      {validationPassed && (
                        <div>
                          <p style={{ fontSize: "0.9rem", color: "#16a34a", marginBottom: "0.5rem" }}>
                            ✅ Tu contenido es apropiado y cumple con nuestras políticas de uso.
                          </p>
                          {validationWarnings.length > 0 && (
                            <div style={{ marginTop: "1rem" }}>
                              <p style={{ fontSize: "0.85rem", color: "#f59e0b", marginBottom: "0.5rem" }}>
                                ⚠️ Recomendaciones:
                              </p>
                              {validationWarnings.map((warning, index) => (
                                <p key={index} style={{ fontSize: "0.8rem", color: "#374151", marginBottom: "0.25rem" }}>
                                  • {warning}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {validationError && (
                        <div style={{ fontSize: "0.9rem", color: "#dc2626" }}>
                          <p style={{ marginBottom: "0.5rem" }}>
                            ❌ {validationError}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "#7f1d1d", marginTop: "0.5rem" }}>
                            Por favor, modifica el contenido para asegurar que sea apropiado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>)}

            {/* Step 2: Configuración de Ads (solo para combo) */}
            {step === 2 && projectType === "combo" && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-chart-line" style={{ marginRight: "0.5rem" }}></i>
                  Configuración de Campaña
                </div>
                <p className="builder-field-hint">
                  Define tu inversión y duración. Te mostraremos estimaciones de alcance y rendimiento.
                </p>

                <div className="builder-field">
                  <label className="builder-label" htmlFor="dailyBudget">
                    <i className="fas fa-euro-sign" style={{ marginRight: "0.5rem" }}></i>
                    Presupuesto Diario (€) *
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
                  <div className="builder-field-hint">
                    Mínimo 1€ por día. Presupuesto recomendado: 5-10€ para empezar.
                  </div>
                </div>

                <div className="builder-field">
                  <label className="builder-label" htmlFor="campaignDuration">
                    <i className="fas fa-calendar-days" style={{ marginRight: "0.5rem" }}></i>
                    Duración (días) *
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
                  <div className="builder-field-hint">
                    Duración recomendada: 7-14 días para testear.
                  </div>
                </div>

                {/* Estimaciones */}
                {estimation.data && (
                  <div className="builder-field builder-field-full">
                    <div className="builder-estimation-card">
                      <div className="builder-estimation-title">
                        <i className="fas fa-chart-bar" style={{ marginRight: "0.5rem" }}></i>
                        Estimaciones de Campaña
                      </div>
                      <div className="builder-estimation-grid">
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">{estimation.data.estimatedImpressions.toLocaleString()}</div>
                          <div className="builder-estimation-label">Impresiones</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">{estimation.data.estimatedClicks.toLocaleString()}</div>
                          <div className="builder-estimation-label">Clics</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">{estimation.data.estimatedCPC}</div>
                          <div className="builder-estimation-label">CPC</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">€{(dailyBudget * campaignDuration).toFixed(2)}</div>
                          <div className="builder-estimation-label">Inversión Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Creación de Anuncio (solo para combo) */}
            {step === 3 && projectType === "combo" && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-bullhorn" style={{ marginRight: "0.5rem" }}></i>
                  Crea tu Anuncio
                </div>
                <p className="builder-field-hint">
                  Escribe el título y mensaje de tu anuncio. La IA validará que sea apropiado antes de publicarlo.
                </p>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="adHeadline">
                    <i className="fas fa-heading" style={{ marginRight: "0.5rem" }}></i>
                    Título del Anuncio *
                  </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="adHeadline"
                      type="text"
                      className="builder-input"
                      placeholder="Ej: ¿Quieres validar tu idea de negocio?"
                      maxLength={100}
                      value={adHeadline}
                      onChange={(e) => {
                        setAdHeadline(e.target.value);
                        setAdValidationPassed(false);
                        setAdValidationError(null);
                      }}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-heading" />
                    </span>
                  </div>
                  <div className="builder-field-hint">
                    Máximo 100 caracteres. Sé claro y directo.
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <label className="builder-label" htmlFor="adMessage">
                    <i className="fas fa-comment-alt" style={{ marginRight: "0.5rem" }}></i>
                    Mensaje del Anuncio *
                  </label>
                  <div className="builder-input-wrapper">
                    <textarea
                      id="adMessage"
                      className="builder-textarea"
                      placeholder="Describe tu proyecto y por qué debería unirse a tu waitlist...

Ej: Descubre cómo validar tu startup antes de invertir tiempo y dinero. Crea tu landing page profesional y atrae los primeros clientes en menos de 24h."
                      maxLength={300}
                      rows={4}
                      value={adMessage}
                      onChange={(e) => {
                        setAdMessage(e.target.value);
                        setAdValidationPassed(false);
                        setAdValidationError(null);
                      }}
                    />
                    <span className="builder-input-icon">
                      <i className="fas fa-comment-alt" />
                    </span>
                  </div>
                  <div className="builder-field-hint">
                    Máximo 300 caracteres. Incluye una llamada a la acción clara.
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <div className="switch-container">
                    <span className="switch-label">
                      <i className="fas fa-image" style={{ marginRight: "0.5rem" }}></i>
                      ¿Quieres incluir una imagen en el anuncio?
                    </span>
                    <button
                      type="button"
                      className={`switch ${wantsAdPicture ? 'active' : ''}`}
                      onClick={() => setWantsAdPicture(!wantsAdPicture)}
                      aria-label="Toggle ad picture"
                    />
                  </div>
                  <div className="builder-field-hint">
                    Las imágenes con anuncios tienen mejor rendimiento, pero son opcionales.
                  </div>
                </div>

                {wantsAdPicture && (
                  <div className="builder-field builder-field-full">
                    <label className="builder-label" htmlFor="adPicture">
                      <i className="fas fa-image" style={{ marginRight: "0.5rem" }}></i>
                      URL de la Imagen
                    </label>
                    <div className="builder-input-wrapper">
                      <input
                        id="adPicture"
                        type="url"
                        className="builder-input"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={adPicture}
                        onChange={(e) => {
                          setAdPicture(e.target.value);
                          setAdValidationPassed(false);
                          setAdValidationError(null);
                        }}
                      />
                      <span className="builder-input-icon">
                        <i className="fas fa-image" />
                      </span>
                    </div>
                    <div className="builder-field-hint">
                      Formatos recomendados: JPG, PNG. Dimensiones: 1200x628px.
                    </div>
                  </div>
                )}

                {/* Validación de Anuncio */}
                {(adValidationLoading || adValidationError || adValidationPassed) && (
                  <div className="builder-field builder-field-full">
                    <div className="builder-estimation-card" style={{
                      background: adValidationPassed
                        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                        : adValidationError
                          ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: adValidationPassed
                        ? '1px solid #bbf7d0'
                        : adValidationError
                          ? '1px solid #fecaca'
                          : '1px solid #e2e8f0'
                    }}>
                      <div className="builder-estimation-title" style={{
                        color: adValidationPassed ? '#16a34a' : adValidationError ? '#dc2626' : '#1e293b'
                      }}>
                        {adValidationLoading && (
                          <>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: "0.5rem" }}></i>
                            Validando anuncio con IA...
                          </>
                        )}
                        {adValidationPassed && (
                          <>
                            <i className="fas fa-check-circle" style={{ marginRight: "0.5rem" }}></i>
                            Anuncio aprobado
                          </>
                        )}
                        {adValidationError && (
                          <>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.5rem" }}></i>
                            Validación requerida
                          </>
                        )}
                      </div>

                      {adValidationLoading && (
                        <div className="builder-estimation-loading">
                          <div className="builder-spinner"></div>
                          Analizando si el anuncio es apropiado y cumple con las políticas...
                        </div>
                      )}

                      {adValidationPassed && (
                        <p style={{ fontSize: "0.9rem", color: "#16a34a", marginBottom: "0" }}>
                          ✅ Tu anuncio ha sido validado y está listo para publicarse.
                        </p>
                      )}

                      {adValidationError && (
                        <div style={{ fontSize: "0.9rem", color: "#dc2626", marginBottom: "0" }}>
                          <p style={{ marginBottom: "0.5rem" }}>
                            ❌ {adValidationError}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "#7f1d1d", marginTop: "0.5rem" }}>
                            Por favor, modifica el contenido del anuncio para asegurar que sea apropiado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Finalización (solo landing-only) */}
            {step === 2 && projectType === "landing-only" && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                  ¡Todo Listo!
                </div>
                <p className="builder-field-hint">
                  Tu landing page está lista para generarse. Revisa la información y confirma para crear tu proyecto.
                </p>

                <div className="builder-field builder-field-full">
                  <div className="builder-estimation-card">
                    <div className="builder-estimation-title">
                      <i className="fas fa-check-circle" style={{ marginRight: "0.5rem" }}></i>
                      Resumen del Proyecto
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Tipo: Solo Landing Page
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Precio: €19
                      </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Proyecto: {projectName}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: "1.4" }}>
                        {landingDescription.substring(0, 150)}...
                      </p>
                    </div>

                    {hasLandingOffer && landingOfferText && (
                      <div style={{ marginBottom: "1rem" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                          Oferta Waitlist
                        </h4>
                        <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                          🎁 {landingOfferText}
                        </p>
                      </div>
                    )}

                    <div style={{ fontSize: "0.85rem", color: "#059669", marginTop: "1rem" }}>
                      ✅ Contenido validado y seguro
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Finalización (combo) */}
            {step === 4 && projectType === "combo" && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                  ¡Todo Listo!
                </div>
                <p className="builder-field-hint">
                  Tu landing page y campaña de anuncios están listas. Revisa la información y confirma para crear tu proyecto.
                </p>

                <div className="builder-field builder-field-full">
                  <div className="builder-estimation-card">
                    <div className="builder-estimation-title">
                      <i className="fas fa-check-circle" style={{ marginRight: "0.5rem" }}></i>
                      Resumen del Proyecto
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Tipo: Combo Landing + Anuncios
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Precio: €49 <span style={{ textDecoration: "line-through", color: "#9ca3af" }}>€59</span>
                      </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Proyecto: {projectName}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: "1.4" }}>
                        {landingDescription.substring(0, 150)}...
                      </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Campaña de Anuncios
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Presupuesto: €{dailyBudget}/día × {campaignDuration} días = €{(dailyBudget * campaignDuration).toFixed(2)}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Título: {adHeadline}
                      </p>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#059669", marginTop: "1rem" }}>
                      ✅ Contenido validado y seguro
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de Navegación */}
            <div className="builder-footer">

              <div className="builder-footer-actions">
                {step > 0 && (
                  <button
                    type="button"
                    className="builder-button builder-button-secondary"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    <i className="fas fa-arrow-left" style={{ marginRight: "0.5rem" }}></i>
                    Anterior
                  </button>
                )}

                {step < totalSteps - 1 ? (
                  <button
                    type="button"
                    className="builder-button builder-button-primary"
                    onClick={handleNext}
                    disabled={submitting}
                  >
                    Siguiente
                    <i className="fas fa-arrow-right" style={{ marginLeft: "0.5rem" }}></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="builder-button builder-button-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="builder-spinner" style={{ width: "16px", height: "16px", marginRight: "0.5rem" }}></div>
                        Creando Proyecto...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                        Crear Proyecto
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MultiStepBuilder;
