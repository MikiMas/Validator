"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "@/lib/authClient";

export default function RegisterPage() {
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
      await registerWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "No se ha podido registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#e0f2fe] to-white flex items-center justify-center p-4">
      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Información */}
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 lg:p-12 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
              <i className="fas fa-chart-line" />
              <span>Validator</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight mt-6">
              Crea una cuenta y empieza a validar tus ideas hoy
            </h1>
            <p className="mt-4 text-white/80 text-base">
              Genera landings atractivas y anuncios en Meta en cuestión de minutos. Sin desarrollo, solo resultados.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  <i className="fas fa-check text-xs" />
                </span>
                <p className="text-white/90">Lanza campañas pequeñas para medir interés real.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  <i className="fas fa-check text-xs" />
                </span>
                <p className="text-white/90">Aprende qué mensaje conecta mejor con tu audiencia.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  <i className="fas fa-check text-xs" />
                </span>
                <p className="text-white/90">Toma decisiones basadas en datos, no en suposiciones.</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">A</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">B</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">C</span>
                </div>
              </div>
              <p className="text-sm text-white/80">+500 emprendedores ya validan con nosotros</p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl flex flex-col justify-center border border-slate-200">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <span className="text-sm font-semibold">V</span>
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Validator
              </span>
            </div>
            <a
              href="/login"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
            >
              Iniciar sesión
            </a>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Crear cuenta</h2>
            <p className="text-slate-700/80 text-base">
              Comienza a validar tus ideas en menos de un minuto.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
                <div className="absolute right-3 top-3 text-slate-400">
                  <i className="far fa-envelope" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-3 top-3 text-slate-400">
                  <i className="far fa-eye-slash" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Mínimo 6 caracteres.</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-xs text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-3 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">O regístrate con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <i className="fab fa-google text-red-500" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <i className="fab fa-facebook text-blue-600" />
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-center text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </main>

      {/* Elementos decorativos */}
      <div className="hidden lg:block absolute top-10 left-10 w-20 h-20 rounded-full bg-sky-100/60 animate-pulse" />
      <div className="hidden lg:block absolute bottom-10 right-10 w-16 h-16 rounded-full bg-purple-100/60 animate-pulse" />
      <div className="hidden lg:block absolute top-1/3 right-20 w-12 h-12 rounded-full bg-blue-100/60 animate-pulse" />
    </div>
  );
}