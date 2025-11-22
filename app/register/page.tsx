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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 space-y-6 border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Validator</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">Crear cuenta</h1>
          <p className="text-gray-400">Comienza a validar tus ideas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-sm text-red-300 text-center">{error}</p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 text-center">
              Comienza a validar tus ideas de startup con landing pages y campañas en Meta
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="text-center">
          <p className="text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}