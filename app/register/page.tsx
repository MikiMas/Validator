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
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4 antialiased">
      <main className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Panel izquierdo - Información */}
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 lg:p-14 shadow-2xl transition-all hover:shadow-indigo-500/50">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
              <i className="fas fa-chart-line text-lg" />
              <span>Validator</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mt-6 tracking-tight">
              Crea una cuenta y empieza a validar tus ideas hoy
            </h1>
            <p className="mt-6 text-indigo-100 text-lg">
              Genera landings atractivas y anuncios en Meta en cuestión de minutos. Sin desarrollo, solo resultados.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex flex-shrink-0 h-6 w-6 items-center justify-center rounded-full bg-white/30 text-sm">
                  <i className="fas fa-check text-xs" />
                </span>
                <p className="text-white/95 text-base font-medium">Lanza campañas pequeñas para medir interés real.</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex flex-shrink-0 h-6 w-6 items-center justify-center rounded-full bg-white/30 text-sm">
                  <i className="fas fa-check text-xs" />
                </span>
                <p className="text-white/95 text-base font-medium">Aprende qué mensaje conecta mejor con tu audiencia.</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex flex-shrink-0 h-6 w-6 items-center justify-center rounded-full bg-white/30 text-sm">
                  <i className="fas fa-check text-xs" />
                </span>
                <p className="text-white/95 text-base font-medium">Valida antes de invertir tiempo y dinero en desarrollo.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-white/20 ring-2 ring-indigo-600 flex items-center justify-center font-bold text-sm hover:z-10 transition-transform hover:scale-110">
                  <span>A</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 ring-2 ring-indigo-600 flex items-center justify-center font-bold text-sm hover:z-10 transition-transform hover:scale-110">
                  <span>B</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 ring-2 ring-indigo-600 flex items-center justify-center font-bold text-sm hover:z-10 transition-transform hover:scale-110">
                  <span>C</span>
                </div>
              </div>
              <p className="text-sm text-indigo-100 font-semibold">+500 emprendedores ya validan con nosotros</p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl border border-slate-100 flex flex-col justify-center transition-all hover:shadow-sky-200/50">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg">
                <span className="text-xl font-bold">V</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Validator
              </span>
            </div>
            <a
              href="/login"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors border-b-2 border-transparent hover:border-indigo-600 pb-0.5"
            >
              Iniciar sesión
            </a>
          </div>

          <div className="space-y-3 mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Crear cuenta</h2>
            <p className="text-slate-600 text-base">
              Comienza a validar tus ideas en menos de un minuto.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
                <div className="absolute right-4 top-3.5 text-slate-400">
                  <i className="far fa-envelope" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-4 top-3.5 text-slate-400">
                  <i className="far fa-eye-slash" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Mínimo 6 caracteres.</p>
            </div>

            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-slate-600">
                Acepto los{" "}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  términos y condiciones
                </a>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-100 p-3">
                <p className="text-sm font-medium text-red-700 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-3 text-base font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                "Crear cuenta gratis"
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-medium">O regístrate con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-colors duration-200"
              >
                <i className="fab fa-google text-red-500 text-lg" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-colors duration-200"
              >
                <i className="fab fa-facebook text-blue-600 text-lg" />
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-10 text-sm text-center text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors border-b border-transparent hover:border-indigo-600"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </main>

      {/* Elementos decorativos */}
      <div className="hidden lg:block absolute top-10 left-10 w-20 h-20 rounded-full bg-sky-200/50 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
      <div className="hidden lg:block absolute bottom-10 right-10 w-16 h-16 rounded-full bg-purple-200/50 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      <div className="hidden lg:block absolute top-1/3 right-20 w-12 h-12 rounded-full bg-blue-200/50 animate-bounce" style={{ animationDuration: '6s' }} />
    </div>
  );
}