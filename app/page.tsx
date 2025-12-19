"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/auth/AuthContext";
import { useGeneration } from "./contexts/generation/GenerationContext";
import { supabase } from "@/lib/supabaseClient";

function LandingPublica() {
  return (
    <div className="lp-wrapper">
      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#" className="lp-logo">
            <img src="/images/logoBuff.png" alt="Buff Launch" className="lp-logo-image" />
            <div className="lp-logo-text">
              <strong>Buff Launch</strong>
            </div>
          </a>
          <div className="lp-nav-actions">
            <a href="/login" className="lp-link-muted">
              Log in
            </a>
            <a href="/register" className="lp-nav-ta">
              Start for free
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-branding">
              <span className="lp-brand-pill">Buff Launch</span>
              <p className="lp-brand-subtext">
                Accelerated validation for SaaS ideas and digital products without wasting time.
              </p>
              <h1 className="lp-headline">
                Validate your ideas before
                <br />
                investing months into development.
              </h1>
              <p className="lp-subheadline">
                Build landing pages and campaigns ready to launch in minutes, and make decisions with real data—not guesses.
              </p>
            </div>

            <div className="lp-hero-buttons">
              <a href="/register" className="lp-btn lp-btn-primary">
                Start validating
              </a>
              <a href="#info" className="lp-btn lp-btn-secondary">
                Learn more
              </a>
            </div>

            <div className="lp-hero-card">
              <div className="lp-hero-card-header">
                <span>Dashboard preview</span>
              </div>
              <div className="lp-hero-card-body lp-hero-card-body-single">
                <div>
                  <p className="lp-metric-label">Example metrics</p>
                  <p className="lp-metric-value">Views, leads, and conversions all in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section" id="info">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Designed to validate, not complicate.</h2>
              <p className="lp-section-text">
                One place to generate your landing page, launch basic campaigns, and see if an idea deserves the next step.
              </p>
            </div>

            <ul className="lp-info-list">
              <li>Describe your idea and goal in a few words.</li>
              <li>Generate a landing page and consistent campaigns in minutes.</li>
              <li>Review clear results and decide the next move.</li>
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
          // For each experiment, load metrics and waitlist separately
          const experimentsWithDetails = await Promise.all(
            data.map(async (experiment: any) => {
              console.log("Processing experiment:", experiment.id, experiment.idea_name);
              
              // Load metrics if it has an ad_id
              let metrics: any = null;
              if (experiment.ad_id) {
                try {
                  console.log("Loading metrics for ad_id:", experiment.ad_id);
                  const res = await fetch(`/api/getAdMetrics?adId=${experiment.ad_id}`, {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
                  });
                  const metricsData = await res.json();
                  console.log("Metrics response:", metricsData);
                  
                  if (metricsData.success && metricsData.data) {
                    // Map Meta's fields to our format
                    metrics = {
                      views: parseInt(metricsData.data.impressions) || 0,
                      clicks: parseInt(metricsData.data.clicks) || 0,
                      spend: parseFloat(metricsData.data.spend) || 0,
                      reach: parseInt(metricsData.data.reach) || 0,
                      ctr: parseFloat(metricsData.data.ctr) || 0,
                      cpc: parseFloat(metricsData.data.cpc) || 0,
                      frequency: parseFloat(metricsData.data.frequency) || 0,
                      waitlist: 0 // Temporary, will update after loading waitlist
                    };
                    console.log("Mapped metrics:", metrics);
                  } else {
                    // If there is no Meta data, use default metrics
                    metrics = {
                      views: 0,
                      clicks: 0,
                      spend: 0,
                      reach: 0,
                      ctr: 0,
                      cpc: 0,
                      frequency: 0,
                      waitlist: 0 // Temporary, will update after loading waitlist
                    };
                    console.log("Using default metrics (no Meta data)");
                  }
                } catch (err) {
                  console.error("Error fetching metrics for experiment:", experiment.id, err);
                    // Default metrics in case of error
                  metrics = {
                    views: 0,
                    clicks: 0,
                    spend: 0,
                    reach: 0,
                    ctr: 0,
                    cpc: 0,
                    frequency: 0,
                      waitlist: 0 // Temporary, will update after loading waitlist
                  };
                }
              } else {
                console.log("Experiment without ad_id, using default metrics");
                // Default metrics when there is no ad_id
                metrics = {
                  views: 0,
                  clicks: 0,
                  spend: 0,
                  reach: 0,
                  ctr: 0,
                  cpc: 0,
                  frequency: 0,
                  waitlist: 0 // Temporary, will update after loading waitlist
                };
              }

              // Load waitlist if a slug exists
              const waitlist: any[] = [];
              if (experiment.slug) {
                try {
                  console.log("Loading waitlist for slug:", experiment.slug);
                  const { data: waitlistData, error: waitlistError } = await supabase
                    .from("waitlist_entries")
                    .select("email, name, created_at")
                    .eq("slug", experiment.slug)
                    .order("created_at", { ascending: false });

                  console.log("Waitlist response:", { waitlistData, waitlistError });
                  if (!waitlistError && waitlistData) {
                    waitlist.push(...waitlistData);
                    console.log("Waitlist loaded:", waitlist.length, "entries");
                  }
                } catch (err) {
                  console.error("Error fetching waitlist for experiment:", experiment.id, err);
                }
              } else {
                console.log("Experiment without slug, skipping waitlist");
              }

              // Update waitlist count in metrics after loading it
              if (metrics) {
                metrics.waitlist = waitlist.length;
                console.log("Metrics updated with waitlist:", metrics);
              }

              const result = {
                ...experiment,
                metrics: metrics,
                waitlist: waitlist
              };
              console.log("Final result for experiment:", result);
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
            <span>Generating your experiment...</span>
          </div>
        );
      case "error":
        return (
          <div className="status-indicator status-error">
            <i className="fas fa-exclamation-triangle"></i>
            <span>An error occurred during generation</span>
          </div>
        );
      case "completed":
        return (
          <div className="status-indicator status-success">
            <i className="fas fa-check-circle"></i>
            <span>Experiment created successfully!</span>
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
    // We could show a toast or notification here
  };

  const downloadWaitlistCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Signup date'],
      ...waitlistModal.waitlist.map(entry => [
        entry.name || 'No name',
        entry.email,
        new Date(entry.created_at).toLocaleDateString('en-US')
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
      return "The landing page will be deleted and will no longer be accessible.";
    }

    const { duration, daysRemaining, adStillRunning, hasAd } = calculateAdState(experiment);

    if (adStillRunning) {
      return `The ad period (${duration} days) is still running (${Math.ceil(daysRemaining)} days left) and invested funds are not refundable.`;
    }

    if (hasAd) {
      return "The ad campaign has ended, but deletion is still irreversible.";
    }

    return "The landing page will be deleted and will no longer be accessible.";
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
    console.log('Delete experiment clicked:', experiment);
    if (!experiment?.id) {
      console.error('No experiment ID found');
      return false;
    }
    setDeleteLoadingId(experiment.id);
    console.log('Sending delete request for experiment ID:', experiment.id);

    try {
      const response = await fetch("/api/deleteExperiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ id: experiment.id })
      });

      console.log('Delete response status:', response.status);
      const result = await response.json();
      console.log('Delete response data:', result);
      
      if (!response.ok || !result?.success) {
        console.error('Delete failed:', response.status, result);
        throw new Error(result?.error || "Could not delete the experiment");
      }

      setExperiments(prev => prev.filter(exp => exp.id !== experiment.id));
      alert(result?.message || "Experiment deleted successfully.");
      return true;
    } catch (error: any) {
      console.error("Error deleting experiment:", error);
      alert(error?.message || "Could not delete the experiment.");
      return false;
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const confirmDeleteExperiment = async () => {
    console.log('confirmDeleteExperiment called, experiment:', deleteModal.experiment);
    if (!deleteModal.experiment) {
      console.log('No experiment in deleteModal');
      return;
    }

    const success = await handleDeleteExperiment(deleteModal.experiment);
    if (success) {
      closeDeleteModal();
    }
  };



  return (
    <div className="dash-page">
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-logo">
            <img src="/images/logoBuff.png" alt="Buff Launch" className="dash-sidebar-logo-image" />
            <div className="dash-sidebar-logo-meta">
              <p className="dash-sidebar-logo-title">Buff Launch</p>
            </div>
          </div>
          <div className="dash-sidebar-divider" aria-hidden="true" />
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
              title="Log out"
            >
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>

          <nav className="dash-nav">
            <button className="dash-nav-item dash-nav-item-active" type="button">
              <i className="fas fa-home" />
              <span>Overview</span>
            </button>
            <button
              className="dash-nav-item"
              type="button"
              onClick={() => router.push("/builder")}
            >
              <i className="fas fa-rocket" />
              <span>New experiment</span>
            </button>
          </nav>
        </aside>

        <main className="dash-main">
          <header className="dash-header">
            <div className="dash-header-top">
              <div>
                <h1 className="dash-title">Welcome back</h1>
                <p className="dash-subtitle">
                  Launch new experiments and validate your ideas with real data
                </p>
              </div>
            </div>
            {getStatusDisplay()}
          </header>

          <div className="dash-grid">
            {/* Experiment status */}
            <section className="dash-card">
              <div className="dash-card-body">
                <div className="dash-card-badge">
                  <i className="fas fa-history" style={{ marginRight: "0.5rem" }}></i>
                  <span>Your projects</span>
                </div>
                <h2 className="dash-card-title">Recent experiments</h2>
                
                {loadingExperiments ? (
                  <div className="loading-skeleton" style={{ height: "120px", borderRadius: "12px" }}></div>
                ) : experiments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <i className="fas fa-inbox" style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "1rem" }}></i>
                    <p className="dash-card-text">
                      You haven't created any experiments yet.
                    </p>
                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                      Your first project is one click away.
                    </p>
                  </div>
                ) : (
                  <div className="dash-card-list">
                    {experiments.slice(0, 5).map((exp) => (
                      <div key={exp.id} className="experiment-card-expanded">
                        {/* Experiment header */}
                        <div className="experiment-card-header">
                          <div>
                            <div className="experiment-card-title">{exp.idea_name}</div>
                            <div className="experiment-card-date">
                              <i className="fas fa-calendar" style={{ marginRight: "0.5rem" }}></i>
                              {new Date(exp.created_at).toLocaleDateString('en-US', {
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
                                View landing page
                              </a>
                            )}
                            <div className="experiment-status">
                              <span className={`status-badge ${exp.ad_id ? 'status-active' : 'status-inactive'}`}>
                                {exp.ad_id ? 'Active' : 'Building ads...'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="experiment-delete-button"
                              onClick={() => openDeleteModal(exp)}
                              disabled={deleteLoadingId === exp.id}
                            >
                              {deleteLoadingId === exp.id ? "Deleting..." : "Delete experiment"}
                            </button>
                          </div>
                        </div>
                        
                        {/* Key metrics */}
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
                                  title="View full list"
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
                            <div className="experiment-metric-label">Spent</div>
                          </div>
                        </div>

                        {/* Expanded section with details */}
                        <div className="experiment-details-section">
                          {/* Space for future sections */}
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
                          View all experiments ({experiments.length})
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
                Delete experiment
              </h3>
              <p className="delete-modal-description">
                Do you want to delete "{deleteModal.experiment?.idea_name}"? This action removes the landing page and it will no longer be accessible.
              </p>
              <p className="delete-modal-warning">
                {getDeletionMessage(deleteModal.experiment)}
                <strong style={{ display: "block", marginTop: "0.25rem" }}>This action cannot be undone.</strong>
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-button delete-modal-button-secondary"
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoadingId === deleteModal.experiment?.id}
              >
                Cancel
              </button>
              <button
                className="delete-modal-button delete-modal-button-danger"
                type="button"
                onClick={() => {
                  console.log('Button clicked! confirmDeleteExperiment:', confirmDeleteExperiment);
                  confirmDeleteExperiment();
                }}
                disabled={deleteLoadingId === deleteModal.experiment?.id}
              >
                {deleteLoadingId === deleteModal.experiment?.id ? "Deleting..." : "Confirm deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Waitlist modal */}
      {waitlistModal.isOpen && (
        <div className="waitlist-modal-overlay" onClick={closeWaitlistModal}>
          <div className="waitlist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="waitlist-modal-header">
              <h3 className="waitlist-modal-title">
                <i className="fas fa-users" style={{ marginRight: "0.5rem", color: "#16a34a" }}></i>
                Waitlist - {waitlistModal.experimentName}
              </h3>
              <button className="waitlist-modal-close" onClick={closeWaitlistModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="waitlist-modal-actions">
              <button className="waitlist-download-button" onClick={downloadWaitlistCSV}>
                <i className="fas fa-download"></i>
                Download CSV
              </button>
            </div>

            <div className="waitlist-modal-content">
              {waitlistModal.waitlist.length > 0 ? (
                <div className="waitlist-table-container">
                  <table className="waitlist-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Signup date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlistModal.waitlist.map((entry: any, index: number) => (
                        <tr key={index}>
                          <td className="waitlist-name">{entry.name || "No name"}</td>
                          <td className="waitlist-email">
                            <button 
                              className="waitlist-email-button"
                              onClick={() => copyEmailToClipboard(entry.email)}
                              title="Copy email"
                            >
                              <i className="fas fa-copy"></i>
                              {entry.email}
                            </button>
                          </td>
                          <td className="waitlist-date">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
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
                  <p>No users are on the waitlist</p>
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
      <main className="app-loader" aria-busy="true" aria-live="polite">
        <div className="app-loader__title">Buff Launch</div>
        <img src="/images/logoBuff.png" alt="Buff Launch" className="app-loader__logo" />
      </main>
    );
  }

  if (!user) {
    return <LandingPublica />;
}

  return <Dashboard />;
}
