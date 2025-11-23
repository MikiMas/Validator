"use client";

import { FormEvent, useState } from "react";
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

  const totalSteps = 2;
  const progressPercent = (step / totalSteps) * 100;

  if (!user) {
    router.push("/login");
    return null;
  }

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus("processing");
    setLastLandingSlug(null);
    setLastAdId(null);

    router.push("/");

    try {
      const landingRes = await fetch("/api/generateLanding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaName: projectName,
          ideaDescription: basicDescription,
          waitlistOffer,
          userId: user.id,
        }),
      });

      if (!landingRes.ok) {
        throw new Error("Error al generar la landing");
      }

      const landingData = await landingRes.json();
      const ideaSlug = landingData?.slug;

      if (ideaSlug) {
        setLastLandingSlug(ideaSlug);
      }

      // Auto-construct the URL for the ad
      const generatedAdUrl = `${window.location.origin}/${ideaSlug}`;

      if (generatedAdUrl) {
        const adRes = await fetch("/api/createMetaAd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: generatedAdUrl,
            projectName: projectName, // Use the main project name
            picture: adPicture,
            message: adMessage, // User only provides the main copy
            adName: `Ad - ${projectName}`, // Auto-generate internal name
            callToActionType: "SIGN_UP", // Best for waitlists
          }),
        });

        if (!adRes.ok) {
          throw new Error("Error al crear el anuncio en Meta");
        }

        const adData = await adRes.json();
        if (adData?.adId) {
          setLastAdId(adData.adId as string);

          if (ideaSlug) {
            await fetch("/api/updateIdea", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug: ideaSlug,
                adId: adData.adId,
              }),
            });
          }
        }
      }

      setStatus("completed");
    } catch (error) {
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
