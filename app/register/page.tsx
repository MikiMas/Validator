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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-6 border border-white/20 shadow-2xl">
        {/* Header con logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Validator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="text-sm text-gray-300">Comienza a validar tus ideas hoy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Email</label>
            <div className="relative">
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-white placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <div className="flex items-start space-x-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-300">
              Al registrarte, podrás crear landing pages y campañas en Meta para validar tus ideas de startup.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-indigo-500/25"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creando cuenta...</span>
              </div>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-400">¿Ya tienes cuenta?</span>
          </div>
        </div>

        <a
          href="/login"
          className="block w-full py-3 text-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 font-medium text-white transition-all duration-200"
        >
          Iniciar sesión
        </a>

        <p className="text-xs text-center text-gray-400 pt-4">
          Al registrarte, aceptas nuestros{" "}
          <a href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">
            Términos de servicio
          </a>{" "}
          y{" "}
          <a href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
            Política de privacidad
          </a>
        </p>
      </div>
    </main>
  );
}