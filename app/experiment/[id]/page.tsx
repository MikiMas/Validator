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

    useEffect(() => {
        async function fetchExperiment() {
            if (!slug || !user) return;

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
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchExperiment();
    }, [slug, user, router]);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!experiment) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => router.push("/")}
                    className="mb-6 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors"
                >
                    &larr; Volver al Dashboard
                </button>

                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{experiment.idea_name}</h1>
                            <p className="text-slate-600 max-w-2xl">{experiment.idea_description}</p>
                        </div>
                        <div className="flex gap-3">
                            {experiment.slug && (
                                <a
                                    href={`/${experiment.slug}`}
                                    target="_blank"
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Ver Landing
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Estado</h3>
                        <p className="text-lg font-semibold text-slate-900">
                            {experiment.ad_id ? "Activo en Meta" : "Solo Landing"}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Fecha de creación</h3>
                        <p className="text-lg font-semibold text-slate-900">
                            {new Date(experiment.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 mb-1">ID del Experimento</h3>
                        <p className="text-sm font-mono text-slate-600 truncate">{experiment.id}</p>
                    </div>
                </div>

                {experiment.ad_id ? (
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i className="fab fa-facebook text-blue-600"></i> Métricas de Meta Ads
                        </h2>

                        {loadingMetrics ? (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : metrics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard label="Impresiones" value={metrics.impressions || 0} />
                                <MetricCard label="Clics" value={metrics.clicks || 0} />
                                <MetricCard label="Gasto" value={`${metrics.spend || 0} ${metrics.currency || 'EUR'}`} />
                                <MetricCard label="CTR" value={`${metrics.ctr || 0}%`} />
                                <MetricCard label="CPC" value={`${metrics.cpc || 0} ${metrics.currency || 'EUR'}`} />
                                <MetricCard label="Alcance" value={metrics.reach || 0} />
                                <MetricCard label="Frecuencia" value={metrics.frequency || 0} />
                                <MetricCard label="Coste por Link Click" value={`${metrics.cost_per_inline_link_click || 0} ${metrics.currency || 'EUR'}`} />
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
                                <p className="text-slate-500">No hay datos disponibles aún para este anuncio.</p>
                                <p className="text-xs text-slate-400 mt-2">ID: {experiment.ad_id}</p>
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800">
                        <p className="font-medium">Este experimento no tiene un anuncio de Meta asociado.</p>
                        <p className="text-sm mt-1 opacity-80">Solo se generó la landing page.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
