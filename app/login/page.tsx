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
      setError(err?.message ?? "No se ha podido iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-4xl">
        <div className="grid gap-0 rounded-3xl bg-white shadow-xl border border-slate-200 md:grid-cols-[1.1fr,1fr] overflow-hidden">
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#0f172a] text-white p-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-100">
                <i className="fas fa-chart-line" />
                <span>Validator</span>
              </div>
              <h1 className="mt-6 text-3xl font-extrabold leading-tight">
                Valida tu idea sin escribir una sola línea de código
              </h1>
              <p className="mt-3 text-sm text-indigo-100/90">
                Crea landings, lanza anuncios en Meta y entiende en minutos si merece la pena invertir en tu próxima idea.
              </p>
            </div>

            <div className="space-y-3 text-sm text-indigo-100/90">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>
                <p>Feedback real de usuarios antes de construir el producto.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>
                <p>Métricas claras de conversión de tus campañas.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 flex flex-col justify-center">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white">
                  <span className="text-sm font-semibold">V</span>
                </div>
                <span className="text-sm font-semibold tracking-tight text-slate-900">Validator</span>
              </div>
              <a
                href="/register"
                className="text-xs font-medium text-[#4f46e5] hover:text-[#4338ca]"
              >
                Crear cuenta
              </a>
            </div>

            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Inicia sesión</h2>
              <p className="text-sm text-slate-500">
                Entra en tu cuenta para seguir validando ideas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                  <a href="/forgot-password" className="text-xs text-[#4f46e5] hover:text-[#4338ca]">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs text-red-600 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#4f46e5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4338ca] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <p className="mt-4 text-xs text-center text-slate-500">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-[#4f46e5] hover:text-[#4338ca] font-medium">
                Regístrate gratis
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}