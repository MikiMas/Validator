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

      console.log("[WaitlistForm] saved successfully in Supabase");
      setSuccess(true);
      setName("");
      setEmail("");
      
      // Confetti effect
      createConfetti();
    } catch (err: any) {
      console.error("Error saving waitlist", err);
      const msg = err?.message ?? "An error occurred. Please try again.";
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
          background: "var(--bg-light)";
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .waitlist-section::before {
          display: none;
        }

        .container {
          max-width: 32rem;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .waitlist-card {
          background: "var(--surface)";
          border-radius: "var(--radius)";
          padding: "2.5rem 2rem";
          box-shadow: "var(--shadow-lg)";
          border: "1px solid #e5e7eb";
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
          height: "4px";
          background: "var(--primary)";
        }

        .waitlist-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: white;
          font-size: 1.75rem;
        }

        .waitlist-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 1rem;
          text-align: center;
          line-height: 1.2;
        }

        .waitlist-description {
          color: var(--text-light);
          margin-bottom: 2rem;
          text-align: center;
          font-size: 1.125rem;
          line-height: 1.6;
        }

        .waitlist-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-dark);
          display: block;
          margin-bottom: 0.35rem;
        }

        .form-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: var(--radius);
          font-size: 0.95rem;
          transition: var(--transition);
          background: var(--surface);
          color: var(--text-dark);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          background: var(--surface);
        }

        .submit-button {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow);
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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: var(--accent);
          padding: 1rem;
          border-radius: var(--radius);
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
          animation: fadeInUp 0.5s ease;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          text-align: center;
          font-weight: 500;
          border: 1px solid #fecaca;
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
                <h2 className="waitlist-title">Join the Waitlist</h2>
                <p className="waitlist-description">
                  Be the first to get access when we launch. Get early access and exclusive benefits.
                </p>

                <form onSubmit={handleSubmit} className="waitlist-form">
                  <div className="form-group">
                    <label className="form-label">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13"/>
                          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Join the waitlist
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
                Thanks for joining! We've sent you a confirmation email.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
