"use client";

import { FormEvent, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth/AuthContext";
import { useGeneration } from "../contexts/generation/GenerationContext";

function MultiStepBuilder() {
  const router = useRouter();
  const { user, loading, accessToken } = useAuth();
  const { setStatus, setLastLandingSlug, setLastAdId } = useGeneration();

  const [step, setStep] = useState<number>(0); // Step 0 = Process overview
  const [submitting, setSubmitting] = useState(false);

  // Estados para contenido de landing escrito por usuario
  const [landingTitle, setLandingTitle] = useState("");
  const [landingDescription, setLandingDescription] = useState("");
  const [landingWaitlistText, setLandingWaitlistText] = useState("");
  const [landingOfferText, setLandingOfferText] = useState("");
  const [hasLandingOffer, setHasLandingOffer] = useState(false);

  // Estado para tema de color de la landing
  const [landingTheme, setLandingTheme] = useState<"dark" | "light">("dark");

  // State for internal project identification
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");

  // AI validation state (only checks that content is appropriate)
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [validationCategory, setValidationCategory] = useState<string | null>(null);
  const [validationSuggestion, setValidationSuggestion] = useState<string | null>(null);

  // Step 2: Ad configuration
  const [dailyBudget, setDailyBudget] = useState(10);
  const [campaignDuration, setCampaignDuration] = useState(7);
  const [adHeadline, setAdHeadline] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [adPicture, setAdPicture] = useState("");
  const [wantsAdPicture, setWantsAdPicture] = useState(false);

  // Ad validation
  const [adValidationLoading, setAdValidationLoading] = useState(false);
  const [adValidationError, setAdValidationError] = useState<string | null>(null);
  const [adValidationPassed, setAdValidationPassed] = useState(false);

  // Impressions estimation
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

  const totalSteps = 5;
  const progressPercent = ((step + 1) / totalSteps) * 100;

  const estimateImpressions = useCallback(async (budget: number) => {
    if (budget < 1) {
      setEstimation({
        loading: false,
        data: null,
        error: "The minimum budget is €1"
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
        throw new Error(data.error || "Error calculating the estimate");
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
      console.error('Error estimating impressions:', error);
      setEstimation({
        loading: false,
        data: null,
        error: error.message
      });
    }
  }, [accessToken]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  // Function to validate landing content with AI (only checks for appropriateness)
  const validateLandingContent = async () => {
    if (!projectName.trim()) {
      setValidationError("Please provide the project name");
      return false;
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!projectSlug.trim() || !slugPattern.test(projectSlug)) {
      setValidationError("Choose a valid URL (lowercase letters, numbers, and dashes only)");
      return false;
    }

    if (!landingTitle.trim() || !landingDescription.trim()) {
      setValidationError("Please fill out the main headline and description");
      return false;
    }

    setValidationLoading(true);
    setValidationError(null);
    setValidationWarnings([]);
    setValidationPassed(false);
    setValidationCategory(null);
    setValidationSuggestion(null);

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
        throw new Error(data.error || "Error validating the content");
      }

      if (data.valid) {
        setValidationPassed(true);
        if (data.warnings && data.warnings.length > 0) {
          setValidationWarnings(data.warnings);
        }
        return true;
      } else {
        setValidationError(data.reason || "The content is not appropriate");
        setValidationCategory(data.category || null);
        setValidationSuggestion(data.suggestion || null);
        return false;
      }
    } catch (error: any) {
      console.error('Error validating content:', error);
      setValidationError('Error validating the content. Please try again.');
      setValidationCategory(null);
      setValidationSuggestion(null);
      return false;
    } finally {
      setValidationLoading(false);
    }
  };

  // AI-based ad content validation
  const validateAdContent = async () => {
    if (!adHeadline.trim() || !adMessage.trim()) {
      setAdValidationError("Please complete the ad headline and message");
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
        throw new Error(data.error || "Error validating the ad");
      }

      if (data.valid) {
        setAdValidationPassed(true);
        return true;
      } else {
        setAdValidationError(data.reason || "The ad content is not appropriate");
        return false;
      }
    } catch (error: any) {
      console.error('Error validating ad content:', error);
      setAdValidationError('Error validating the ad. Please try again.');
      return false;
    } finally {
      setAdValidationLoading(false);
    }
  };

  // Step navigation
  const nextStep = async () => {
    // Landing content validation (first step after the introduction)
    if (step === 1) {
      const isValid = await validateLandingContent();
      if (!isValid) return;
    }

    // Ad validation
    if (step === 3) {
      const isValid = await validateAdContent();
      if (!isValid) return;
    }

    // Resetear validaciones al cambiar de paso
    setValidationError(null);
    setAdValidationError(null);

    // Only proceed if not on the last step
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };


  // Debounced estimation effect
  useEffect(() => {
    if (!user) return;
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
      // Generate landing and campaign in a single endpoint
      const response = await fetch("/api/generateLanding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          ideaName: projectName,
          ideaDescription: landingDescription,
          waitlistOffer: hasLandingOffer ? landingOfferText : "",
          landingTitle,
          landingWaitlistText,
          customSlug: projectSlug,
          landingTheme, // Add the selected theme
          campaignSettings: {
            durationDays: campaignDuration,
            dailyBudget: dailyBudget,
            totalBudget: dailyBudget * campaignDuration
          },
          adHeadline,
          adMessage,
          adPicture: wantsAdPicture ? adPicture : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error creating the project");
      }

      const data = await response.json();
      const ideaSlug = data?.slug;

      if (ideaSlug) {
        setLastLandingSlug(ideaSlug);
        setLastAdId(data?.adData?.adId);
        setStatus("completed");
        // Redirect after successful creation
        router.push("/");
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      setStatus("error");
      // Show error message to user
      setValidationError(error.message || "Error processing the request. Please try again.");
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
            <h1 className="builder-title">Validate your venture</h1>
            <p className="builder-subtitle">
              Describe your project and let AI craft all the content for you.
            </p>
          </div>

          <div className="builder-progress-bar">
            <div className="builder-progress" style={{ width: `${progressPercent}%` }} />
          </div>

          <form className="builder-form" onSubmit={handleSubmit}>
                        {/* Step 0: Process overview */}
            {step === 0 && (
              <div className="builder-form-grid">
                  <div className="builder-section-title">
                  <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                  How we build your landing page + ads?
                </div>

                <div className="builder-field builder-field-full">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem", marginTop: "1rem" }}>
                    <div style={{ padding: "2rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff", minHeight: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #475569 0%, #475569 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "1.1rem"
                        }}>
                          1
                        </div>
                        <strong style={{ fontSize: "1.1rem", color: "#1e293b" }}>Your idea</strong>
                      </div>
                        <p style={{ margin: "0", color: "#475569", lineHeight: "1.5" }}>
                        Define the headline and description that will appear on your landing page.</p>
                    </div>
                    <div style={{ padding: "2rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff", minHeight: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #475569 0%, #475569 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "1.1rem"
                        }}>
                          2
                        </div>
                        <strong style={{ fontSize: "1.1rem", color: "#1e293b" }}>AI-generated landing page</strong>
                      </div>
                      <p style={{ margin: "0", color: "#475569", lineHeight: "1.5" }}>
                        Our AI creates the landing page with the headline, description, and waitlist in moments.</p>
                    </div>
                    <div style={{ padding: "2rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff", minHeight: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #475569 0%, #475569 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "1.1rem"
                        }}>
                          3
                        </div>
                        <strong style={{ fontSize: "1.1rem", color: "#1e293b" }}>Ad campaign</strong>
                      </div>
                      <p style={{ margin: "0", color: "#475569", lineHeight: "1.5" }}>
                        Pick budget and duration while we write the ad headline and copy to attract relevant traffic.
                      </p>
                    </div>
                    <div style={{ padding: "2rem", borderRadius: "1rem", border: "1px solid #e2e8f0", background: "#fff", minHeight: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #475569 0%, #475569 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "1.1rem"
                        }}>
                          4
                        </div>
                        <strong style={{ fontSize: "1.1rem", color: "#1e293b" }}>Review & launch</strong>
                      </div>
                      <p style={{ margin: "0", color: "#475569", lineHeight: "1.5" }}>
                        We show a summary of everything generated before creating the project and launching it automatically.
                      </p>
                    </div>
                  </div>
                  <div className="builder-field-hint" style={{ marginTop: "1.5rem" }}>
                    <i className="fas fa-info-circle" style={{ marginRight: "0.5rem" }}></i>
                    We move step by step so you stay in control and can see the outcome.
                  </div>
                </div>
              </div>
            )}

                  {/* Step 1: Landing content with preview */}
            {step === 1 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
                  {/* Editing panel */}
                  <div>
                    <div className="builder-section-title">
                      <i className="fas fa-edit" style={{ marginRight: "0.5rem" }}></i>
                      Write your landing page content
                    </div>
                    <p className="builder-field-hint">
                      Type exactly what you want to show on your landing page. You stay in full control.
                    </p>

                    <div className="builder-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="landingTitle">
                          <i className="fas fa-heading" style={{ marginRight: "0.5rem" }}></i>
                          Main headline *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="landingTitle"
                            type="text"
                            className="builder-input"
                            placeholder="e.g., The revolutionary app that changes everything"
                            required
                            value={landingTitle}
                            onChange={(e) => {
                      if (e.target.value.length <= 40) {
                        setLandingTitle(e.target.value);
                      }
                    }}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-heading" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          The main headline visitors will see.
                          <span style={{ 
                            float: 'right', 
                            color: landingTitle.length === 40 ? '#dc2626' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {landingTitle.length}/40
                          </span>
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="landingDescription">
                          <i className="fas fa-align-left" style={{ marginRight: "0.5rem" }}></i>
                          Primary description *
                        </label>
                        <div className="builder-input-wrapper">
                          <textarea
                            id="landingDescription"
                            className="builder-textarea"
                            placeholder="Describe your product or service clearly and compellingly..."
                            required
                            value={landingDescription}
                            onChange={(e) => {
                      if (e.target.value.length <= 600) {
                        setLandingDescription(e.target.value);
                      }
                    }}
                            rows={6}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-align-left" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          Explain what you offer, who it's for, and why it's special.
                          <span style={{ 
                            float: 'right', 
                            color: landingDescription.length === 600 ? '#dc2626' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {landingDescription.length}/ 600
                          </span>
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="landingWaitlistText">
                          <i className="fas fa-users" style={{ marginRight: "0.5rem" }}></i>
                          Waitlist text *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="landingWaitlistText"
                            type="text"
                            className="builder-input"
                            placeholder="e.g., Join the waitlist and be the first to test it"
                            required
                            value={landingWaitlistText}
                            onChange={(e) => {
                      if (e.target.value.length <= 60) {
                        setLandingWaitlistText(e.target.value);
                      }
                    }}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-users" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                          Text that will motivate visitors to sign up.
                          <span style={{ 
                            float: 'right', 
                            color: landingWaitlistText.length === 60 ? '#dc2626' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {landingWaitlistText.length}/60
                          </span>
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <div className="switch-container">
                          <span className="switch-label">
                            <i className="fas fa-gift" style={{ marginRight: "0.5rem" }}></i>
                            Want to include a special offer?
                          </span>
                          <button
                            type="button"
                            className={`switch ${hasLandingOffer ? 'active' : ''}`}
                            onClick={() => setHasLandingOffer(!hasLandingOffer)}
                            aria-label="Toggle landing page offer"
                          />
                        </div>
                      </div>

                      {hasLandingOffer && (
                        <div className="builder-field builder-field-full">
                          <label className="builder-label" htmlFor="landingOfferText">
                            <i className="fas fa-tag" style={{ marginRight: "0.5rem" }}></i>
                            Offer text *
                          </label>
                          <div className="builder-input-wrapper">
                            <input
                              id="landingOfferText"
                              type="text"
                              className="builder-input"
                              placeholder="e.g., 20% launch discount, early access..."
                              required
                              value={landingOfferText}
                              onChange={(e) => {
                      if (e.target.value.length <= 80) {
                        setLandingOfferText(e.target.value);
                      }
                    }}
                            />
                            <span className="builder-input-icon">
                              <i className="fas fa-gift" />
                            </span>
                          </div>
                          <div className="builder-field-hint">
                            Describe the special offer for early users.
                            <span style={{ 
                              float: 'right', 
                              color: landingOfferText.length === 80 ? '#dc2626' : '#6b7280',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
                              {landingOfferText.length}/80
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="builder-field builder-field-full">
                        <div className="builder-section-title" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                          <i className="fas fa-palette" style={{ marginRight: "0.5rem" }}></i>
                          Landing theme
                        </div>
                        <p className="builder-field-hint" style={{ marginBottom: "1rem" }}>
                          Choose the visual style you prefer for your landing page.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                          {/* Tema Oscuro */}
                          <div
                            className={`builder-estimation-card ${landingTheme === "dark" ? "selected" : ""}`}
                            style={{
                              cursor: "pointer",
                              border: landingTheme === "dark" ? "2px solid #1e293b" : "1px solid #e2e8f0",
                              background: landingTheme === "dark" ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "white",
                              transition: "all 0.3s ease",
                              color: landingTheme === "dark" ? "white" : "#1e293b",
                              padding: "1.5rem"
                            }}
                            onClick={() => setLandingTheme("dark")}
                          >
                            <div className="builder-estimation-title" style={{ 
                              color: landingTheme === "dark" ? "white" : "#1e293b",
                              marginBottom: "1rem"
                            }}>
                              <i className="fas fa-moon" style={{ marginRight: "0.5rem" }}></i>
                              Dark theme
                            </div>
                            <div style={{ fontSize: "0.9rem", marginBottom: "1rem", lineHeight: "1.5" }}>
                              Modern, elegant design with a dark background and bright elements. Ideal for tech and premium products.
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "#1e293b",
                                border: "1px solid rgba(255,255,255,0.2)"
                              }}></div>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "#334155"
                              }}></div>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "#f8fafc"
                              }}></div>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                              }}></div>
                            </div>
                          </div>

                          {/* Tema Claro */}
                          <div
                            className={`builder-estimation-card ${landingTheme === "light" ? "selected" : ""}`}
                            style={{
                              cursor: "pointer",
                              border: landingTheme === "light" ? "2px solid #16a34a" : "1px solid #e2e8f0",
                              background: landingTheme === "light" ? "white" : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                              transition: "all 0.3s ease",
                              color: "#1e293b",
                              padding: "1.5rem"
                            }}
                            onClick={() => setLandingTheme("light")}
                          >
                            <div className="builder-estimation-title" style={{ 
                              color: "#1e293b",
                              marginBottom: "1rem"
                            }}>
                              <i className="fas fa-sun" style={{ marginRight: "0.5rem" }}></i>
                              Light theme
                            </div>
                            <div style={{ fontSize: "0.9rem", marginBottom: "1rem", lineHeight: "1.5" }}>
                              Clean, accessible layout with a white background and green accents. Perfect for friendly or corporate products.
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "white",
                                border: "1px solid #e2e8f0"
                              }}></div>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "#f8fafc"
                              }}></div>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "#16a34a"
                              }}></div>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
                              }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel de vista previa */}
                  <div style={{ minWidth: 0 }}>
                    <div className="builder-section-title">
                      <i className="fas fa-eye" style={{ marginRight: "0.5rem" }}></i>
                      Landing page preview
                    </div>
                    <p className="builder-field-hint">
                      This is how your landing page will look on mobile.
                      Design may vary depending on the viewer's screen resolution.
                    </p>

                    <div style={{
                      position: 'relative',
                      minHeight: '600px',
                      background: landingTheme === 'dark'
                            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                            : 'linear-gradient(135deg, #f8fafc 0%, rgba(255, 255, 255, 0.8) 100%)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      boxShadow: landingTheme === 'dark' 
                        ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                        : '0 20px 40px rgba(0, 0, 0, 0.1)'
                    }}>
                      {/* Elementos flotantes de fondo */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        zIndex: 1
                      }}>
                        <div style={{
                          position: 'absolute',
                          width: '60px',
                          height: '60px',
                          top: '10%',
                          right: '10%',
                          borderRadius: '50%',
                          background: landingTheme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)',
                          border: landingTheme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          animation: 'float 8s infinite ease-in-out'
                        }}></div>
                        <div style={{
                          position: 'absolute',
                          width: '40px',
                          height: '40px',
                          bottom: '20%',
                          left: '15%',
                          borderRadius: '50%',
                          background: landingTheme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)',
                          border: landingTheme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          animation: 'float 8s infinite ease-in-out 3s'
                        }}></div>
                        <div style={{
                          position: 'absolute',
                          width: '30px',
                          height: '30px',
                          top: '30%',
                          left: '5%',
                          borderRadius: '50%',
                          background: landingTheme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)',
                          border: landingTheme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          animation: 'float 8s infinite ease-in-out 6s'
                        }}></div>
                      </div>

                      {/* Content principal */}
                      <div style={{
                        position: 'relative',
                        zIndex: 2,
                        padding: '3rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '600px'
                      }}>
                        {/* Badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: landingTheme === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: landingTheme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.2)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          color: landingTheme === 'dark'
                            ? 'rgba(255, 255, 255, 0.8)'
                            : 'rgba(0, 0, 0, 0.7)',
                          marginBottom: '2rem'
                        }}>
                          <i className="fas fa-sparkles" />
                          <span>Coming soon</span>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            lineHeight: '1.1',
                            marginBottom: '1.5rem',
                            color: landingTheme === 'dark'
                              ? '#f8fafc'
                              : '#1e293b',
                            letterSpacing: '-0.02em',
                            textAlign: 'center',
                            width: '100%',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal'
                        }}>
                          {landingTitle || "Your headline will appear here"}
                      </h1>

                        {/* Description */}
                        <p style={{
                            fontSize: '1.2rem',
                            color: landingTheme === 'dark'
                              ? 'rgba(255, 255, 255, 0.8)'
                              : 'rgba(0, 0, 0, 0.7)',
                            marginBottom: '2rem',
                            lineHeight: '1.7',
                            maxWidth: '42rem',
                            width: '100%',
                            textAlign: 'center',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                          {landingDescription || "Your description will appear here..."}
                      </p>

                        {/* Tarjeta de lista de espera */}
                      <div style={{
                          width: '100%',
                          maxWidth: '34rem',
                          background: landingTheme === 'dark'
                            ? 'rgba(30, 41, 59, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          padding: '2rem',
                          borderRadius: '28px',
                          boxShadow: landingTheme === 'dark'
                            ? '0 30px 60px rgba(0, 0, 0, 0.5)'
                            : '0 30px 60px rgba(0, 0, 0, 0.15)',
                          border: landingTheme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          position: 'relative',
                          overflow: 'hidden'
                      }}>
                          {/* Barra superior decorativa */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: landingTheme === 'dark'
                              ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                              : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                          }}></div>

                          {/* Icono */}
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: landingTheme === 'dark'
                              ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                              : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            boxShadow: landingTheme === 'dark'
                              ? '0 8px 25px rgba(255, 255, 255, 0.2)'
                              : '0 8px 25px rgba(22, 163, 74, 0.3)',
                            color: landingTheme === 'dark' ? '#1e293b' : 'white',
                            fontSize: '1.25rem'
                        }}>
                          <i className="fas fa-users" />
                        </div>

                          {/* Waitlist title */}
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: landingTheme === 'dark' ? '#f8fafc' : '#1e293b',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            lineHeight: '1.2'
                        }}>
                          {landingWaitlistText || "Waitlist copy"}
                        </h2>

                          {/* Texto de oferta */}
                        <p style={{
                            color: landingTheme === 'dark'
                              ? 'rgba(255, 255, 255, 0.7)'
                              : 'rgba(0, 0, 0, 0.7)',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            fontSize: '1rem',
                            lineHeight: '1.6'
                        }}>
                          Be the first to access features when we launch. Gain early access and exclusive perks.
                        </p>

                          {/* Formulario */}
                          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '700',
                                  color: landingTheme === 'dark' ? '#f8fafc' : '#1e293b',
                                  letterSpacing: '0.02em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                            }}>
                              <i className="fas fa-user" />
                              Full name
                            </label>
                                <div style={{ position: 'relative' }}>
                                  <span style={{
                                    position: 'absolute',
                                    left: '0.85rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: landingTheme === 'dark'
                                      ? 'rgba(255, 255, 255, 0.5)'
                                      : 'rgba(0, 0, 0, 0.5)',
                                    pointerEvents: 'none',
                                    fontSize: '0.95rem'
                                  }}>
                                    <i className="fas fa-id-badge" />
                                  </span>
                              <input
                                type="text"
                                placeholder="Your name"
                              disabled
                              style={{
                                      width: '100%',
                                      padding: '1rem 1.25rem 1rem 2.75rem',
                                      border: landingTheme === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.2)'
                                        : '2px solid rgba(0, 0, 0, 0.2)',
                                      borderRadius: '14px',
                                      fontSize: '1rem',
                                      background: landingTheme === 'dark'
                                        ? 'rgba(15, 23, 42, 0.6)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                      backdropFilter: 'blur(10px)',
                                      color: landingTheme === 'dark' ? '#f8fafc' : '#1e293b',
                                      boxShadow: landingTheme === 'dark'
                                        ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                                        : '0 10px 30px rgba(0, 0, 0, 0.06)',
                                      transition: 'all 0.25s ease'
                              }}
                            />
                                </div>
                          </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '700',
                                  color: landingTheme === 'dark' ? '#f8fafc' : '#1e293b',
                                  letterSpacing: '0.02em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                            }}>
                              <i className="fas fa-envelope" />
                              Email address
                            </label>
                                <div style={{ position: 'relative' }}>
                                  <span style={{
                                    position: 'absolute',
                                    left: '0.85rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: landingTheme === 'dark'
                                      ? 'rgba(255, 255, 255, 0.5)'
                                      : 'rgba(0, 0, 0, 0.5)',
                                    pointerEvents: 'none',
                                    fontSize: '0.95rem'
                                  }}>
                                    <i className="fas fa-at" />
                                  </span>
                              <input
                                type="email"
                                placeholder="you@example.com"
                              disabled
                              style={{
                                      width: '100%',
                                      padding: '1rem 1.25rem 1rem 2.75rem',
                                      border: landingTheme === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.2)'
                                        : '2px solid rgba(0, 0, 0, 0.2)',
                                      borderRadius: '14px',
                                      fontSize: '1rem',
                                      background: landingTheme === 'dark'
                                        ? 'rgba(15, 23, 42, 0.6)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                      backdropFilter: 'blur(10px)',
                                      color: landingTheme === 'dark' ? '#f8fafc' : '#1e293b',
                                      boxShadow: landingTheme === 'dark'
                                        ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                                        : '0 10px 30px rgba(0, 0, 0, 0.06)',
                                      transition: 'all 0.25s ease'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                          <button
                            type="button"
                            onClick={(event) => event.preventDefault()}
                            style={{
                                width: '100%',
                                background: landingTheme === 'dark'
                                  ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                                  : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                color: landingTheme === 'dark' ? '#1e293b' : 'white',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '1rem 1.5rem',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: landingTheme === 'dark'
                                  ? '0 8px 25px rgba(255, 255, 255, 0.2)'
                                  : '0 8px 25px rgba(22, 163, 74, 0.3)',
                                marginTop: '1.25rem'
                            }}
                          >
                            <i className="fas fa-paper-plane" />
                            Join the list
                          </button>
                        </form>
                        </div>

                        {/* Oferta especial */}
                        {hasLandingOffer && landingOfferText && (
                          <div style={{
                            background: landingTheme === 'dark'
                              ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.1) 0%, rgba(226, 232, 240, 0.1) 100%)'
                              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                            border: landingTheme === 'dark'
                              ? '1px solid rgba(248, 250, 252, 0.2)'
                              : '1px solid rgba(34, 197, 94, 0.2)',
                            color: landingTheme === 'dark' ? '#f8fafc' : '#16a34a',
                            padding: '1rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            marginTop: '1.5rem',
                            backdropFilter: 'blur(10px)'
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
                            Experiment name *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="projectName"
                            type="text"
                            className="builder-input"
                            placeholder="Ej: MiApp Emprendimiento"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                          />
                          <span className="builder-input-icon">
                            <i className="fas fa-lightbulb" />
                          </span>
                        </div>
                        <div className="builder-field-hint">
                        Only you will see it in the dashboard.
                        </div>
                      </div>

                      <div className="builder-field builder-field-full">
                        <label className="builder-label" htmlFor="projectSlug">
                          <i className="fas fa-link" style={{ marginRight: "0.5rem" }}></i>
                          Custom URL *
                        </label>
                        <div className="builder-input-wrapper">
                          <input
                            id="projectSlug"
                            type="text"
                            className="builder-input"
                            placeholder="e.g., my-page"
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
                          Your landing page will be at: <strong>bufflaunch.com/{projectSlug || "your-url"}</strong> (lowercase letters, numbers, and dashes only). We check for duplicates before saving.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content validation */}
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
                            Content aprobado
                          </>
                        )}
                        {validationError && (
                          <>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.5rem" }}></i>
                            Validation required
                          </>
                        )}
                      </div>

                      {validationLoading && (
                        <div className="builder-estimation-loading">
                          <div className="builder-spinner"></div>
                          Analyzing if the content is appropriate and meets the policies...
                        </div>
                      )}

                      {validationPassed && (
                        <div>
                          <p style={{ fontSize: "0.9rem", color: "#16a34a", marginBottom: "0.5rem" }}>
                            ✅ Your content is appropriate and meets our usage policies.
                          </p>
                          {validationWarnings.length > 0 && (
                            <div style={{ marginTop: "1rem" }}>
                              <p style={{ fontSize: "0.85rem", color: "#f59e0b", marginBottom: "0.5rem" }}>
                                ⚠ Recommendations:
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
                            ✖ {validationError}
                          </p>
                          {validationCategory && (
                            <p style={{ marginBottom: "0.25rem", fontSize: "0.8rem", color: "#b91c1c" }}>
                              Categoría: {validationCategory}
                            </p>
                          )}
                          {validationSuggestion && (
                            <p style={{ marginBottom: "0.5rem", fontSize: "0.8rem", color: "#b91c1c" }}>
                              Sugerencia: {validationSuggestion}
                            </p>
                          )}
                          <p style={{ fontSize: "0.8rem", color: "#7f1d1d", marginTop: "0.5rem" }}>
                            Por favor, modifica el contenido para asegurar que sea apropiado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>)}

            {/* Step 2: Ad configuration */}
            {step === 2 && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-chart-line" style={{ marginRight: "0.5rem" }}></i>
                  Campaign configuration
                </div>
                <p className="builder-field-hint">
                  Define your investment and duration. We will show reach and performance estimates.
                </p>

                <div className="builder-field">
                  <label className="builder-label" htmlFor="dailyBudget">
                    <i className="fas fa-euro-sign" style={{ marginRight: "0.5rem" }}></i>
                    Daily Budget (€) *
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
                    Minimum €1 per day. Recommended budget: €5-10 to start.
                  </div>
                </div>

                <div className="builder-field">
                  <label className="builder-label" htmlFor="campaignDuration">
                    <i className="fas fa-calendar-days" style={{ marginRight: "0.5rem" }}></i>
                    Duration (days) *
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
                    Recommended duration: 7-14 days to test.
                  </div>
                </div>

                {/* Estimaciones */}
                {estimation.data && (
                  <div className="builder-field builder-field-full">
                    <div className="builder-estimation-card">
                      <div className="builder-estimation-title">
                        <i className="fas fa-chart-bar" style={{ marginRight: "0.5rem" }}></i>
                        Campaign estimates
                      </div>
                      <div className="builder-estimation-grid">
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">{estimation.data.estimatedImpressions.toLocaleString()}</div>
                          <div className="builder-estimation-label">Impresiones diarias</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">{estimation.data.estimatedClicks.toLocaleString()}</div>
                          <div className="builder-estimation-label">Clics diarios</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">{estimation.data.estimatedCPC}</div>
                          <div className="builder-estimation-label">CPC</div>
                        </div>
                        <div className="builder-estimation-item">
                          <div className="builder-estimation-value">€{(dailyBudget * campaignDuration).toFixed(2)}</div>
                          <div className="builder-estimation-label">Total investment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Ad creation */}
            {step === 3 && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-bullhorn" style={{ marginRight: "0.5rem" }}></i>
                  Crea tu Anuncio
                </div>
                  <p className="builder-field-hint">
                  Write your ad headline and message. AI will verify it is appropriate before publishing.
                </p>

                <div className="builder-field builder-field-full">
                          <label className="builder-label" htmlFor="adHeadline">
                            <i className="fas fa-heading" style={{ marginRight: "0.5rem" }}></i>
                            Ad headline *
                          </label>
                  <div className="builder-input-wrapper">
                    <input
                      id="adHeadline"
                      type="text"
                      className="builder-input"
                      placeholder="e.g., Want to validate your business idea?"
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
                      Maximum 100 characters. Be clear and direct.
                    </div>
                </div>

                <div className="builder-field builder-field-full">
                          <label className="builder-label" htmlFor="adMessage">
                            <i className="fas fa-comment-alt" style={{ marginRight: "0.5rem" }}></i>
                            Ad message *
                          </label>
                  <div className="builder-input-wrapper">
                      <textarea
                        id="adMessage"
                        className="builder-textarea"
                        placeholder="Describe your project and why people should join your waitlist...

e.g., Discover how to validate your venture before investing time and money. Create a professional landing page and attract your first customers in under 24h."
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
                    Maximum 300 characters. Include a clear call to action.
                  </div>
                </div>

                <div className="builder-field builder-field-full">
                  <div className="switch-container">
                    <span className="switch-label">
                      <i className="fas fa-image" style={{ marginRight: "0.5rem" }}></i>
                      Want to include an image in the ad?
                    </span>
                    <button
                      type="button"
                      className={`switch ${wantsAdPicture ? 'active' : ''}`}
                      onClick={() => setWantsAdPicture(!wantsAdPicture)}
                      aria-label="Alternar imagen del anuncio"
                    />
                  </div>
                  <div className="builder-field-hint">
                    Images often perform better with ads, but they are optional.
                  </div>
                </div>

                {wantsAdPicture && (
                  <div className="builder-field builder-field-full">
                    <label className="builder-label" htmlFor="adPicture">
                      <i className="fas fa-image" style={{ marginRight: "0.5rem" }}></i>
                      Image URL
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
                      Recommended formats: JPG, PNG. Dimensions: 1200x628px.
                    </div>
                  </div>
                )}

                {/* Ad validation */}
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
                            Validating ad with AI...
                          </>
                        )}
                        {adValidationPassed && (
                          <>
                            <i className="fas fa-check-circle" style={{ marginRight: "0.5rem" }}></i>
                            Ad approved
                          </>
                        )}
                        {adValidationError && (
                          <>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.5rem" }}></i>
                            Validation required
                          </>
                        )}
                      </div>

                      {adValidationLoading && (
                          <div className="builder-estimation-loading">
                          <div className="builder-spinner"></div>
                          Analyzing whether the ad is appropriate and policy compliant...
                        </div>
                      )}

                      {adValidationPassed && (
                        <p style={{ fontSize: "0.9rem", color: "#16a34a", marginBottom: "0" }}>
                          ✅ Great! Your ad has been validated and is ready to publish.
                        </p>
                      )}

                      {adValidationError && (
                        <div style={{ fontSize: "0.9rem", color: "#dc2626", marginBottom: "0" }}>
                          <p style={{ marginBottom: "0.5rem" }}>
                            ✖ {adValidationError}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "#7f1d1d", marginTop: "0.5rem" }}>
                            Please update the ad content to ensure it remains appropriate.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Completion */}
            {step === 4 && (
              <div className="builder-form-grid">
                <div className="builder-section-title">
                  <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                  All set!
                </div>
                <p className="builder-field-hint">
                  Your landing page and ad campaign are ready. Review the details and confirm to create your project.
                </p>

                <div className="builder-field builder-field-full">
                  <div className="builder-estimation-card">
                    <div className="builder-estimation-title">
                      <i className="fas fa-check-circle" style={{ marginRight: "0.5rem" }}></i>
                      Project summary
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Tipo: Landing + Anuncios
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Price: €49 <span style={{ textDecoration: "line-through", color: "#9ca3af" }}>€59</span>
                      </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Project: {projectName}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: "1.4" }}>
                        {landingDescription}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: "#1e293b", marginTop: "0.5rem" }}>
                        <strong>Headline:</strong> {adHeadline}
                      </p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Ad campaign
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Budget: €{dailyBudget}/day × {campaignDuration} days = €{(dailyBudget * campaignDuration).toFixed(2)}
                      </p>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#059669", marginTop: "1rem" }}>
                      ✓ Content validado y seguro
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="builder-footer">

              <div className="builder-footer-actions">
                {step === 0 && (
                  <button
                    type="button"
                    className="builder-button builder-button-secondary"
                    onClick={() => router.push("/")}
                    disabled={submitting}
                  >
                    <i className="fas fa-arrow-left" style={{ marginRight: "0.5rem" }}></i>
                    Back to dashboard
                  </button>
                )}
                
                {step > 0 && (
                  <button
                    type="button"
                    className="builder-button builder-button-secondary"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    <i className="fas fa-arrow-left" style={{ marginRight: "0.5rem" }}></i>
                    Back
                  </button>
                )}

                {step < totalSteps - 1 ? (
                  <button
                    type="button"
                    className="builder-button builder-button-primary"
                    onClick={handleNext}
                    disabled={submitting}
                  >
                    Next
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
                        Creating project...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket" style={{ marginRight: "0.5rem" }}></i>
                        Create project
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
