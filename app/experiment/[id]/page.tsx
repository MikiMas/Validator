"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../../AuthContext";

export default function ExperimentDetails() {
    const { id: slug } = useParams(); // We use the same route param name [id] but treat it as slug
    const router = useRouter();
    const { user } = useAuth();
    const [experiment, setExperiment] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [loadingWaitlist, setLoadingWaitlist] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        async function fetchExperiment() {
            if (!slug || !user || hasLoaded) return;

            try {
                const { data, error } = await supabase
                    .from("ideas")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (error) {
                    console.error("Error fetching experiment:", error);
                    // router.push("/"); // Optional: redirect on error
                    return;
                }

                setExperiment(data);

                if (data.ad_id) {
                    fetchMetrics(data.ad_id);
                    fetchPreview(data.ad_id);
                }

                if (data.slug) {
                    fetchWaitlist(data.slug);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
                setHasLoaded(true);
            }
        }

        fetchExperiment();
    }, [slug, user, hasLoaded]);

    async function fetchMetrics(adId: string) {
        setLoadingMetrics(true);
        try {
            const res = await fetch(`/api/getAdMetrics?adId=${adId}`);
            const data = await res.json();
            if (data.success) {
                setMetrics(data.data);
            }
        } catch (err) {
            console.error("Error fetching metrics:", err);
        } finally {
            setLoadingMetrics(false);
        }
    }

    async function fetchPreview(adId: string) {
        try {
            setLoadingPreview(true);
            const res = await fetch(`/api/metaPreview?adId=${adId}`);
            const data = await res.json();
            if (data.success && data.html) {
                setPreviewHtml(data.html as string);
            } else {
                setPreviewHtml(null);
            }
        } catch (err) {
            console.error("Error fetching Meta preview:", err);
            setPreviewHtml(null);
        } finally {
            setLoadingPreview(false);
        }
    }

    async function fetchWaitlist(slugValue: string) {
        try {
            setLoadingWaitlist(true);
            const { data, error } = await supabase
                .from("waitlist_entries")
                .select("email, name, created_at")
                .eq("slug", slugValue)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching waitlist entries:", error);
                return;
            }

            setWaitlist(data || []);
        } catch (err) {
            console.error("Unexpected error fetching waitlist:", err);
        } finally {
            setLoadingWaitlist(false);
        }
    }

    const buildHtml = () => {
        if (!experiment) return "";

        const hasAd = Boolean(experiment.ad_id);
        const createdAt = experiment.created_at
            ? new Date(experiment.created_at).toLocaleDateString()
            : "-";

        const statusText = hasAd ? "Activo en Meta" : "Solo landing";
        const statusClass = hasAd ? "status-badge status-active" : "status-badge status-inactive";

        const backHref = "/";
        const landingHref = experiment.slug ? `/${experiment.slug}` : "#";

        const impressions = metrics?.impressions ?? 0;
        const clicks = metrics?.clicks ?? 0;
        const spend = metrics?.spend ?? 0;
        const currency = metrics?.currency ?? "EUR";
        const ctr = metrics?.ctr ?? 0;
        const cpc = metrics?.cpc ?? 0;
        const reach = metrics?.reach ?? 0;
        const frequency = metrics?.frequency ?? 0;
        const cplc = metrics?.cost_per_inline_link_click ?? 0;

        const adImageBlock = experiment.fotourl
            ? `
                <div class="ad-image">
                    <img src="${experiment.fotourl}" alt="Creatividad del anuncio" class="ad-image-tag" />
                </div>
            `
            : `<div class="ad-image"></div>`;

        const waitlistCount = waitlist.length;
        const waitlistItemsHtml = waitlist
            .map((entry: any) => {
                const date = entry.created_at
                    ? new Date(entry.created_at).toLocaleString("es-ES")
                    : "-";
                const name = entry.name || "(Sin nombre)";
                return `
                    <li class="waitlist-item">
                        <div class="waitlist-main">
                            <div class="waitlist-name">${name}</div>
                            <div class="waitlist-email">${entry.email}</div>
                        </div>
                        <div class="waitlist-date">${date}</div>
                    </li>
                `;
            })
            .join("");

        const formatNumber = (value: number) =>
            typeof value === "number" ? value.toLocaleString("es-ES", { maximumFractionDigits: 2 }) : String(value);

        const adPreviewSection = hasAd
            ? previewHtml
                ? `
                <section class="dash-card">
                    <div class="dash-card-body">
                        <h2 class="dash-card-title">
                            <i class="fab fa-facebook text-blue-600"></i>
                            Previsualización del anuncio
                        </h2>
                        <div class="ad-preview-embed">${previewHtml}</div>
                        <p class="ad-note">Esta es una previsualización real proporcionada por Meta. El formato puede variar ligeramente según el dispositivo.</p>
                    </div>
                </section>
            `
                : loadingPreview
                    ? `
                <section class="dash-card">
                    <div class="dash-card-body">
                        <h2 class="dash-card-title">
                            <i class="fab fa-facebook text-blue-600"></i>
                            Previsualización del anuncio
                        </h2>
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </section>
            `
                    : `
                <section class="dash-card">
                    <div class="dash-card-body">
                        <h2 class="dash-card-title">
                            <i class="fab fa-facebook text-blue-600"></i>
                            Previsualización del anuncio
                        </h2>
                        <div class="ad-preview">
                            <div class="ad-header">
                                <div class="ad-brand">
                                    <div class="ad-info">
                                        <h3>${experiment.idea_name ?? "Página"}</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="ad-main-text">
                                ${experiment.idea_description ?? ""}
                            </div>
                            ${adImageBlock}
                            <div class="ad-link-block">
                                <div class="ad-link-text">
                                    <span class="ad-link-title">${experiment.idea_name ?? ""}</span>
                                </div>
                                <button class="ad-link-cta">Más información</button>
                            </div>
                        </div>
                        <p class="ad-note">Esta es una previsualización aproximada del anuncio. El formato final en Meta puede variar ligeramente.</p>
                    </div>
                </section>
            `
            : "";
        const metricsSection = !hasAd
            ? `
                <div class="info-banner">
                    <p>Este experimento no tiene un anuncio de Meta asociado.</p>
                    <p class="small">Solo se generó la landing page.</p>
                </div>
            `
            : loadingMetrics
            ? `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            `
            : metrics
            ? `
                <div class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div class="metric-card">
                        <div class="metric-label">Alcance</div>
                        <div class="metric-value">${formatNumber(reach)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Clics</div>
                        <div class="metric-value">${formatNumber(clicks)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Coste</div>
                        <div class="metric-value">${formatNumber(spend)} ${currency}</div>
                    </div>
                </div>
            `
            : `
                <div class="empty-state">
                    <p>No hay datos disponibles aún para este anuncio.</p>
                    <p class="small">ID: ${experiment.ad_id}</p>
                </div>
            `;

        const waitlistSection = loadingWaitlist
            ? `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            `
            : waitlistCount > 0
            ? `
                <div class="waitlist-summary">
                    <p class="waitlist-count"><strong>${waitlistCount}</strong> personas apuntadas a la lista de espera.</p>
                    <ul class="waitlist-list">
                        ${waitlistItemsHtml}
                    </ul>
                </div>
            `
            : `
                <div class="empty-state">
                    <p>Aún no hay emails en la lista de espera para este experimento.</p>
                </div>
            `;

        return `
            <style>
                :root {
                    --primary: #1a365d;
                    --primary-light: #2d4a80;
                    --secondary: #4f46e5;
                    --secondary-light: #6366f1;
                    --accent: #0ea5e9;
                    --text-primary: #1e293b;
                    --text-secondary: #64748b;
                    --text-light: #94a3b8;
                    --bg-primary: #f8fafc;
                    --bg-secondary: #f1f5f9;
                    --bg-card: #ffffff;
                    --border: #e2e8f0;
                    --success: #10b981;
                    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                }

                .dash-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                }

                .dash-shell {
                    flex: 1;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    grid-template-columns: none;
                }

                .dash-main {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: color 0.2s ease;
                    padding: 0.5rem 0;
                }

                .back-btn:hover {
                    color: var(--primary);
                }

                .dash-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                }

                .dash-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }

                .dash-subtitle {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    max-width: 600px;
                }

                .btn-primary {
                    background-color: var(--secondary);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    box-shadow: var(--shadow);
                }

                .btn-primary:hover {
                    background-color: var(--secondary-light);
                }

                .dash-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .dash-card {
                    background-color: var(--bg-card);
                    border-radius: 0.75rem;
                    box-shadow: var(--shadow);
                    overflow: hidden;
                }

                .dash-card-body {
                    padding: 1.5rem;
                }

                .dash-card-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--primary);
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .grid-cols-1 {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                @media (min-width: 1024px) {
                    .lg\\:grid-cols-\\[minmax\\(0\\,1\\.4fr\\)_minmax\\(0\\,1fr\\)\\] {
                        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
                    }
                }

                .metric-card {
                    background-color: var(--bg-card);
                    border-radius: 0.5rem;
                    padding: 1.25rem;
                    box-shadow: var(--shadow);
                    border-left: 4px solid var(--accent);
                }

                .metric-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .metric-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .info-item {
                    background-color: var(--bg-card);
                    border-radius: 0.5rem;
                    padding: 1.25rem;
                    box-shadow: var(--shadow);
                }

                .info-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .info-value {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .ad-preview {
                    background-color: var(--bg-card);
                    border-radius: 0.75rem;
                    overflow: hidden;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border);
                    font-size: 0.8125rem;
                }

                .ad-preview-embed {
                    margin-top: 0.5rem;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    max-height: 320px;
                }

                .ad-header {
                    padding: 0.75rem 1rem 0.5rem;
                }

                .ad-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .ad-info h3 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .ad-info p {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .ad-main-text {
                    padding: 0.5rem 1rem 0.5rem;
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    font-size: 0.85rem;
                    color: var(--text-primary);
                }

                .ad-image {
                    height: 11rem;
                    background-color: var(--bg-secondary);
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .ad-image-tag {
                    max-height: 100%;
                    max-width: 100%;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    display: block;
                }

                .ad-link-block {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    gap: 0.75rem;
                    background-color: #f9fafb;
                }

                .ad-link-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.1rem;
                    max-width: 70%;
                }

                .ad-link-domain {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    color: var(--text-light);
                    letter-spacing: 0.04em;
                }

                .ad-link-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .ad-link-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .ad-link-cta {
                    background-color: #1877f2;
                    color: #fff;
                    border: none;
                    border-radius: 0.25rem;
                    padding: 0.45rem 0.9rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .ad-link-cta:hover {
                    background-color: #1458b5;
                }

                .ad-note {
                    margin-top: 0.5rem;
                    font-size: 0.72rem;
                    color: var(--text-light);
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-active {
                    background-color: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }

                .status-inactive {
                    background-color: rgba(100, 116, 139, 0.1);
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 3rem;
                }

                .spinner {
                    width: 2rem;
                    height: 2rem;
                    border: 2px solid var(--border);
                    border-top: 2px solid var(--accent);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .empty-state {
                    background-color: var(--bg-card);
                    border-radius: 0.75rem;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: var(--shadow);
                }

                .empty-state p {
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .empty-state .small {
                    font-size: 0.75rem;
                    color: var(--text-light);
                }

                .info-banner {
                    background-color: rgba(14, 165, 233, 0.1);
                    border: 1px solid rgba(14, 165, 233, 0.2);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    color: var(--primary);
                }

                .info-banner p {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .info-banner .small {
                    font-size: 0.875rem;
                    opacity: 0.8;
                }

                .waitlist-card {
                    background-color: var(--bg-card);
                    border-radius: 0.75rem;
                    box-shadow: var(--shadow);
                    padding: 1.5rem;
                    margin-top: 1.5rem;
                }

                .waitlist-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--primary);
                    margin-bottom: 1rem;
                }

                .waitlist-count {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                }

                .waitlist-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    max-height: 260px;
                    overflow-y: auto;
                }

                .waitlist-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.6rem 0.75rem;
                    border-radius: 0.5rem;
                    background-color: #f8fafc;
                }

                .waitlist-main {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.15rem;
                }

                .waitlist-name {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .waitlist-email {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    word-break: break-all;
                }

                .waitlist-date {
                    font-size: 0.8rem;
                    color: var(--text-light);
                    margin-left: 1rem;
                    white-space: nowrap;
                }

                @media (min-width: 768px) {
                    .md\:grid-cols-2 {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .info-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (min-width: 1024px) {
                    .lg\:grid-cols-3 {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .info-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
            </style>

            <div class="dash-page">
                <div class="dash-shell">
                    <main class="dash-main">
                        <a href="${backHref}" class="back-btn">
                            <i class="fas fa-arrow-left"></i>
                            Volver al Dashboard
                        </a>

                        <header class="dash-header">
                            <div>
                                <h1 class="dash-title">${experiment.idea_name ?? ""}</h1>
                                <p class="dash-subtitle">${experiment.idea_description ?? ""}</p>
                            </div>
                            <div>
                                ${experiment.slug ? `
                                    <a href="${landingHref}" target="_blank" class="btn-primary">
                                        <i class="fas fa-external-link-alt"></i>
                                        Ver Landing
                                    </a>
                                ` : ""}
                            </div>
                        </header>

                        <div class="dash-grid">
                            <div class="grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                                <section class="dash-card">
                                    <div class="dash-card-body">
                                        <h2 class="dash-card-title">Resumen del experimento</h2>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <h3 class="info-label">Estado</h3>
                                                <div class="info-value">
                                                    <span class="${statusClass}">${statusText}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <h3 class="info-label">Fecha de creación</h3>
                                                <p class="info-value">${createdAt}</p>
                                            </div>
                                            <div class="info-item">
                                                <h3 class="info-label">ID del Experimento</h3>
                                                <p class="info-value">${experiment.id}</p>
                                            </div>
                                        </div>

                                        <div style="margin-top:1.75rem; border-top:1px solid var(--border); padding-top:1.5rem;">
                                            <h2 class="dash-card-title" style="margin-bottom:1rem;">
                                                <i class="fab fa-facebook text-blue-600"></i>
                                                Métricas de Meta Ads
                                            </h2>
                                            ${metricsSection}
                                        </div>
                                    </div>
                                </section>

                                ${adPreviewSection}
                            </div>

                            <section class="waitlist-card">
                                <h2 class="waitlist-title">Lista de espera</h2>
                                ${waitlistSection}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        `;
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-shell">
                    <main className="dash-main">
                        <div className="dash-card">
                            <div className="dash-card-body">
                                <p className="dash-card-text">Cargando experimento...</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!experiment) return null;

    return <div dangerouslySetInnerHTML={{ __html: buildHtml() }} />;
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
