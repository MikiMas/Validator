export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";

function buildHtml(landing: any, slug: string) {
  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const heroTitle = escapeHtml(landing?.heroTitle ?? "Revoluciona tu Experiencia Digital");
  const heroDescription = escapeHtml(landing?.heroDescription ?? "");
  const waitlistTitle = escapeHtml(landing?.waitlistTitle || "Únete a la lista de espera");
  const waitlistOffer = escapeHtml(
    landing?.waitlistOffer ||
      "Sé el primero en acceder a nuestras funciones exclusivas y recibe un 20% de descuento en tu primer año."
  );
  const themeMode = landing?.theme === "light" ? "light" : "dark";
  const palettes: Record<
    string,
    {
      primary: string;
      primaryLight: string;
      secondary: string;
      secondaryLight: string;
      accent: string;
      accentLight: string;
      textPrimary: string;
      textSecondary: string;
      textLight: string;
      bgPrimary: string;
      bgSecondary: string;
      bgCard: string;
      border: string;
      success: string;
      gradient: string;
      gradientAccent: string;
      shadow: string;
      shadowLg: string;
      floatingBg: string;
      floatingBorder: string;
      floatingShadow: string;
      formIcon: string;
      calloutBg: string;
      calloutBorder: string;
    }
  > = {
    dark: {
      primary: "#f8fafc",
      primaryLight: "#e2e8f0",
      secondary: "#16a34a",
      secondaryLight: "#22c55e",
      accent: "#0ea5e9",
      accentLight: "#38bdf8",
      textPrimary: "#f8fafc",
      textSecondary: "rgba(248, 250, 252, 0.8)",
      textLight: "rgba(248, 250, 252, 0.6)",
      bgPrimary: "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)",
      bgSecondary: "rgba(248, 250, 252, 0.05)",
      bgCard: "rgba(15, 23, 42, 0.88)",
      border: "rgba(255, 255, 255, 0.2)",
      success: "#16a34a",
      gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      gradientAccent: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
      shadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
      shadowLg: "0 35px 80px rgba(0, 0, 0, 0.5)",
      floatingBg: "rgba(255, 255, 255, 0.04)",
      floatingBorder: "rgba(255, 255, 255, 0.15)",
      floatingShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      formIcon: "rgba(248, 250, 252, 0.9)",
      calloutBg: "rgba(255, 255, 255, 0.06)",
      calloutBorder: "rgba(255, 255, 255, 0.15)"
    },
    light: {
      primary: "#0f172a",
      primaryLight: "#1f2937",
      secondary: "#0f172a",
      secondaryLight: "#475569",
      accent: "#0ea5e9",
      accentLight: "#38bdf8",
      textPrimary: "#0f172a",
      textSecondary: "rgba(15, 23, 42, 0.8)",
      textLight: "rgba(15, 23, 42, 0.6)",
      bgPrimary: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      bgSecondary: "rgba(15, 23, 42, 0.05)",
      bgCard: "#ffffff",
      border: "rgba(15, 23, 42, 0.12)",
      success: "#059669",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #60a5fa 100%)",
      gradientAccent: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      shadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
      shadowLg: "0 30px 70px rgba(15, 23, 42, 0.18)",
      floatingBg: "rgba(15, 23, 42, 0.06)",
      floatingBorder: "rgba(15, 23, 42, 0.18)",
      floatingShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
      formIcon: "rgba(15, 23, 42, 0.7)",
      calloutBg: "rgba(15, 23, 42, 0.05)",
      calloutBorder: "rgba(15, 23, 42, 0.1)"
    }
  };
  const palette = palettes[themeMode] || palettes.dark;
  const colorVars = `
        :root {
            --primary: ${palette.primary};
            --primary-light: ${palette.primaryLight};
            --secondary: ${palette.secondary};
            --secondary-light: ${palette.secondaryLight};
            --accent: ${palette.accent};
            --accent-light: ${palette.accentLight};
            --text-primary: ${palette.textPrimary};
            --text-secondary: ${palette.textSecondary};
            --text-light: ${palette.textLight};
            --bg-primary: ${palette.bgPrimary};
            --bg-secondary: ${palette.bgSecondary};
            --bg-card: ${palette.bgCard};
            --border: ${palette.border};
            --success: ${palette.success};
            --gradient: ${palette.gradient};
            --gradient-accent: ${palette.gradientAccent};
            --shadow: ${palette.shadow};
            --shadow-lg: ${palette.shadowLg};
            --floating-bg: ${palette.floatingBg};
            --floating-border: ${palette.floatingBorder};
            --floating-shadow: ${palette.floatingShadow};
            --input-icon-color: ${palette.formIcon};
            --callout-bg: ${palette.calloutBg};
            --callout-border: ${palette.calloutBorder};
        }
    `;
  const year = new Date().getFullYear();

  return `
    <style>
${colorVars}
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .landing-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .landing-page::before {
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

        .hero-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 1.5rem;
            position: relative;
            z-index: 2;
        }

        .hero-content {
            max-width: 64rem;
            width: 100%;
            margin: 0 auto;
            text-align: center;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 9999px;
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
            transition: all 0.3s ease;
        }

        .hero-badge:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
        }

        .hero-title {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 2rem;
            background: linear-gradient(135deg, #f8fafc 0%, rgba(255, 255, 255, 0.8) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.02em;
            animation: fadeInUp 0.8s ease;
        }

        .hero-description {
            font-size: 1.375rem;
            color: var(--text-secondary);
            margin-bottom: 3rem;
            line-height: 1.7;
            max-width: 42rem;
            margin-left: auto;
            margin-right: auto;
            animation: fadeInUp 0.8s ease 0.2s both;
        }

        .waitlist-container {
            width: 100%;
            max-width: 34rem;
            background: var(--bg-card);
            backdrop-filter: blur(20px);
            padding: 3rem;
            border-radius: 28px;
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            margin: 0 auto;
            animation: fadeInUp 0.8s ease 0.4s both;
        }

        .waitlist-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-accent);
        }

        .waitlist-container::after {
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
            width: 60px;
            height: 60px;
            background: var(--gradient-accent);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
        }

        .waitlist-icon i {
            color: white;
            font-size: 1.5rem;
        }

        .waitlist-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 1rem;
            text-align: center;
        }

        .waitlist-offer {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            font-size: 1.1rem;
            text-align: center;
            line-height: 1.6;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-top: 1.25rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .form-label {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--primary);
            letter-spacing: 0.02em;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }

        .input-wrap {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 0.85rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--input-icon-color);
            opacity: 0.75;
            pointer-events: none;
            font-size: 0.95rem;
        }

        .form-input {
            width: 100%;
            padding: 1rem 1.25rem 1rem 2.75rem;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-radius: 14px;
            font-size: 1rem;
            transition: all 0.25s ease;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            color: var(--primary);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }

        .form-input::placeholder {
            color: var(--text-secondary);
        }

        .form-input:focus {
            outline: none;
            border-color: var(--secondary);
            box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
            background: rgba(255, 255, 255, 1);
        }

        .form-button {
            width: 100%;
            background: var(--gradient-accent);
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

        .form-footer {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            background: var(--callout-bg);
            border-radius: 12px;
            border: 1px dashed var(--callout-border);
        }

        .form-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s ease;
        }

        .form-button:hover::before {
            left: 100%;
        }

        .form-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(22, 163, 74, 0.4);
        }

        .form-button:active {
            transform: translateY(0);
        }

        .success-message {
            background: linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
            border: 1px solid rgba(22, 163, 74, 0.2);
            color: var(--success);
            padding: 1.5rem;
            border-radius: 16px;
            margin-top: 1.5rem;
            text-align: center;
            font-weight: 600;
            font-size: 1.1rem;
            backdrop-filter: blur(10px);
            animation: fadeInUp 0.5s ease;
        }

        .success-message i {
            font-size: 1.5rem;
            margin-right: 0.5rem;
        }

        footer {
            padding: 2rem 1.5rem;
            text-align: center;
            color: var(--text-light);
            font-size: 0.9rem;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            z-index: 2;
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
            background: var(--floating-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--floating-border);
            box-shadow: var(--floating-shadow);
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

        .element-4 {
            width: 100px;
            height: 100px;
            bottom: 10%;
            right: 20%;
            animation-delay: 9s;
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

        @media (max-width: 768px) {
            .hero-section {
                padding: 2rem 1rem;
            }
            
            .hero-title {
                font-size: 2.5rem;
            }
            
            .hero-description {
                font-size: 1.125rem;
            }
            
            .waitlist-container {
                padding: 2rem;
            }
            
            .waitlist-title {
                font-size: 1.75rem;
            }
        }

        @media (max-width: 480px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .waitlist-container {
                padding: 1.5rem;
            }
            
            .hero-description {
                font-size: 1rem;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }

            .form-button {
                padding: 0.9rem 1.1rem;
            }

            .floating-elements {
                display: none;
            }
        }
    </style>

    <main class="landing-page">
        <div class="floating-elements">
            <div class="floating-element element-1"></div>
            <div class="floating-element element-2"></div>
            <div class="floating-element element-3"></div>
            <div class="floating-element element-4"></div>
        </div>

        <section class="hero-section">
            <div class="hero-content">
                <div class="hero-badge">
                    <i class="fas fa-sparkles"></i>
                    <span>Próximamente disponible</span>
                </div>
                
                <h1 class="hero-title">
                    ${heroTitle}
                </h1>
                
                <p class="hero-description">
                    ${heroDescription}
                </p>

                <div class="waitlist-container">
                    <div class="waitlist-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    
                    <h2 class="waitlist-title">${waitlistTitle}</h2>
                    <p class="waitlist-offer">${waitlistOffer}</p>
                    
                    <form class="waitlist-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="name" class="form-label">
                                    <i class="fas fa-user"></i>
                                    Nombre completo
                                </label>
                                <div class="input-wrap">
                                    <span class="input-icon"><i class="fas fa-id-badge"></i></span>
                                    <input type="text" id="name" class="form-input" placeholder="Tu nombre" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="email" class="form-label">
                                    <i class="fas fa-envelope"></i>
                                    Correo electrónico
                                </label>
                                <div class="input-wrap">
                                    <span class="input-icon"><i class="fas fa-at"></i></span>
                                    <input type="email" id="email" class="form-input" placeholder="tu@email.com" required>
                                </div>
                            </div>
                        </div>

                        <div class="form-footer">
                            <i class="fas fa-shield-alt"></i>
                            Usaremos tu correo solo para avisarte del lanzamiento. Sin spam.
                        </div>

                        <button type="submit" class="form-button" style="margin-top: 1.25rem;">
                            <i class="fas fa-paper-plane"></i>
                            Unirme a la lista
                        </button>
                    </form>
                    
                    <div class="success-message" style="display: none;">
                        <i class="fas fa-check-circle"></i>
                        ¡Gracias por unirte! Te hemos enviado un correo de confirmación.
                    </div>
                </div>
            </div>
        </section>
        
        <footer>
            <p>&copy; ${year} ${heroTitle}. Todos los derechos reservados.</p>
        </footer>
    </main>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Set dynamic page title
            var heroTitleElement = document.querySelector('.hero-title');
            if (heroTitleElement) {
                var pageTitle = heroTitleElement.textContent.trim();
                if (pageTitle && pageTitle !== 'Revoluciona tu Experiencia Digital') {
                    document.title = pageTitle;
                }
            }
            
            var form = document.querySelector('.waitlist-form');
            var successMessage = document.querySelector('.success-message');
            if (!form || !successMessage) return;

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                var nameInput = document.getElementById('name');
                var emailInput = document.getElementById('email');
                var name = nameInput ? nameInput.value : '';
                var email = emailInput ? emailInput.value : '';

                if (!email) return;

                // Add loading state
                var submitButton = form.querySelector('.form-button');
                var originalContent = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                submitButton.disabled = true;

                try {
                    var res = await fetch('/api/waitlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ slug: '${slug}', name, email }),
                    });

                    if (res.ok) {
                        form.style.display = 'none';
                        successMessage.style.display = 'block';
                        
                        // Confetti effect (simple implementation)
                        createConfetti();
                    } else {
                        throw new Error('Error al enviar el formulario');
                    }
                } catch (error) {
                    console.error('Error al enviar el formulario:', error);
                    // Reset button on error
                    submitButton.innerHTML = originalContent;
                    submitButton.disabled = false;
                    alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
                }
            });
        });

        // Simple confetti effect
        function createConfetti() {
            var colors = ['#16a34a', '#22c55e', '#1e293b', '#334155'];
            var confettiCount = 50;
            
            for (var i = 0; i < confettiCount; i++) {
                var confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-20px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'fall ' + (Math.random() * 2 + 2) + 's linear';
                
                document.body.appendChild(confetti);
                
                setTimeout(function() {
                    confetti.remove();
                }, 4000);
            }
        }

        // Add falling animation
        var style = document.createElement('style');
        var cssText = '@keyframes fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }';
        style.textContent = cssText;
        document.head.appendChild(style);
    </script>
  `;
}

export default async function Landing({ params }: any) {
  const { data, error } = await supabase
    .from("ideas")
    .select("landing, idea_name")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    return <div className="p-10 text-center">Landing no encontrada</div>;
  }

  const landing = (data as any).landing;
  const ideaName = (data as any).idea_name;

  return (
    <>
      <title>{ideaName || "Landing"}</title>
      <div dangerouslySetInnerHTML={{ __html: buildHtml(landing, params.slug) }} />
    </>
  );
}
