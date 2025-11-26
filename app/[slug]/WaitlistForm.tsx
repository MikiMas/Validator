"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

interface WaitlistFormProps {
  slug: string;
}

export default function WaitlistForm({ slug }: WaitlistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    setError(null);

    try {
      console.log("[WaitlistForm] submit", { name, email, slug });

      const { error } = await supabase.from("waitlist_entries").insert({
        slug,
        name,
        email,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      console.log("[WaitlistForm] guardado OK en Supabase");
      setSuccess(true);
      setName("");
      setEmail("");
      
      // Confetti effect
      createConfetti();
    } catch (err: any) {
      console.error("Error guardando waitlist", err);
      const msg = err?.message ?? "Ha ocurrido un error. Inténtalo de nuevo.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Simple confetti effect
  const createConfetti = () => {
    const colors = ['#16a34a', '#22c55e', '#1e293b', '#334155'];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '8px';
      confetti.style.height = '8px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-20px';
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `fall ${Math.random() * 2 + 2}s linear`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 4000);
    }
  };

  return (
    <>
      <style jsx>{`
        .waitlist-section {
          padding: 4rem 1.5rem;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .waitlist-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          pointer-events: none;
          z-index: 1;
        }

        .container {
          max-width: 32rem;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .waitlist-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.8s ease;
        }

        .waitlist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
        }

        .waitlist-card::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .waitlist-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
        }

        .waitlist-icon svg {
          color: white;
          font-size: 2rem;
        }

        .waitlist-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1rem;
          text-align: center;
          line-height: 1.1;
        }

        .waitlist-description {
          color: #64748b;
          margin-bottom: 2.5rem;
          text-align: center;
          font-size: 1.125rem;
          line-height: 1.6;
        }

        .waitlist-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          color: #1e293b;
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .form-input:focus {
          outline: none;
          border-color: #16a34a;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
          background: rgba(255, 255, 255, 0.95);
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
        }

        .submit-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .submit-button:hover::before {
          left: 100%;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(22, 163, 74, 0.4);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .success-message {
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
          border: 1px solid rgba(22, 163, 74, 0.2);
          color: #16a34a;
          padding: 1.5rem;
          border-radius: 16px;
          text-align: center;
          font-weight: 600;
          font-size: 1.1rem;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.5s ease;
        }

        .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .floating-element {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: float 20s infinite ease-in-out;
        }

        .element-1 {
          width: 120px;
          height: 120px;
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .element-2 {
          width: 80px;
          height: 80px;
          bottom: 20%;
          left: 15%;
          animation-delay: 3s;
        }

        .element-3 {
          width: 60px;
          height: 60px;
          top: 30%;
          left: 5%;
          animation-delay: 6s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .waitlist-section {
            padding: 2rem 1rem;
          }
          
          .waitlist-card {
            padding: 2rem;
          }
          
          .waitlist-title {
            font-size: 2rem;
          }
          
          .waitlist-description {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .waitlist-card {
            padding: 1.5rem;
          }
          
          .waitlist-title {
            font-size: 1.75rem;
          }
        }
      `}</style>

      <section id="waitlist" className="waitlist-section">
        <div className="floating-elements">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>

        <div className="container">
          <div className="waitlist-card">
            <div className="waitlist-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>

            {!success ? (
              <>
                <h2 className="waitlist-title">Únete a la Lista de Espera</h2>
                <p className="waitlist-description">
                  Sé el primero en acceder cuando lancemos. Obtén acceso anticipado y beneficios exclusivos.
                </p>

                <form onSubmit={handleSubmit} className="waitlist-form">
                  <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="form-input"
                    />
                  </div>

                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13"/>
                          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Unirme a la lista
                      </>
                    )}
                  </button>
                </form>

                {error && <p className="error-message">{error}</p>}
              </>
            ) : (
              <div className="success-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <path d="M22 4L12 14.01l-3-3"/>
                </svg>
                ¡Gracias por unirte! Te hemos enviado un correo de confirmación.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
