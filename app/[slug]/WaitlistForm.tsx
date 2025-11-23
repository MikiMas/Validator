"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

interface WaitlistFormProps {
  slug: string;
}

export default function WaitlistForm({ slug }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      console.log("[WaitlistForm] submit", { email, slug });

      const { error } = await supabase.from("waitlist_entries").insert({
        slug,
        email,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      console.log("[WaitlistForm] guardado OK en Supabase");
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error("Error guardando waitlist", err);
      const msg = err?.message ?? "Ha ocurrido un error. Inténtalo de nuevo.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="waitlist-section">
      <div className="container text-center">
        <h2>Apúntate a la lista de espera</h2>
        <p>Déjame tu email y te avisaré cuando lancemos esta idea.</p>
        <form onSubmit={handleSubmit} className="waitlist-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            className="waitlist-input"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Enviando..." : "Unirme a la lista"}
          </button>
        </form>
        {success && <p className="success-message">¡Gracias! Te hemos apuntado.</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </section>
  );
}
