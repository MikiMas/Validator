export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";

function buildHtml(landing: any, slug: string) {
  const heroTitle = landing.heroTitle ?? "Revoluciona tu Experiencia Digital";
  const heroDescription = landing.heroDescription ?? "";
  const waitlistTitle = landing.waitlistTitle || "Únete a la lista de espera";
  const waitlistOffer = landing.waitlistOffer || "Sé el primero en acceder a nuestras funciones exclusivas y recibe un 20% de descuento en tu primer año.";
  const year = new Date().getFullYear();

  return `
    <style>
        :root {
            --primary: #0f172a;
            --primary-light: #1f2937;
            --secondary: #1d4ed8;
            --secondary-light: #2563eb;
            --accent: #0ea5e9;

            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --text-light: #94a3b8;
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --bg-card: #ffffff;
            --border: #e2e8f0;
            --success: #10b981;
            --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.18), 0 4px 6px -2px rgba(15, 23, 42, 0.15);
            --gradient: linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #0ea5e9 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .min-h-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .flex-1 {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.5rem;
        }

        .max-w-3xl {
            max-width: 48rem;
        }

        .mx-auto {
            margin-left: auto;
            margin-right: auto;
        }

        .w-full {
            width: 100%;
        }

        .text-center {
            text-align: center;
        }

        .hero-title {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-description {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 3rem;
            line-height: 1.7;
            max-width: 36rem;
            margin-left: auto;
            margin-right: auto;
        }

        .waitlist-container {
            width: 100%;
            max-width: 28rem;
            background: var(--bg-card);
            padding: 2.5rem;
            border-radius: 1.5rem;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
            position: relative;
            overflow: hidden;
            margin: 0 auto;
        }

        .waitlist-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient);
        }

        .waitlist-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.75rem;
        }

        .waitlist-offer {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            font-size: 1rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .form-input {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            font-size: 1rem;
            transition: all 0.2s ease;
            background-color: var(--bg-primary);
        }

        .form-input:focus {
            outline: none;
            border-color: var(--secondary);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-button {
            width: 100%;
            background: var(--gradient);
            color: white;
            border: none;
            border-radius: 0.75rem;
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .form-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
        }

        .form-button:active {
            transform: translateY(0);
        }

        .success-message {
            background-color: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: var(--success);
            padding: 1rem;
            border-radius: 0.75rem;
            margin-top: 1rem;
            text-align: center;
            font-weight: 500;
        }

        footer {
            padding: 2rem 1.5rem;
            text-align: center;
            color: var(--text-light);
            font-size: 0.875rem;
            background-color: var(--bg-secondary);
            border-top: 1px solid var(--border);
        }

        .floating-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }

        .shape {
            position: absolute;
            border-radius: 50%;
            opacity: 0.05;
        }

        .shape-1 {
            width: 200px;
            height: 200px;
            background: var(--secondary);
            top: -100px;
            right: -50px;
        }

        .shape-2 {
            width: 150px;
            height: 150px;
            background: var(--accent);
            bottom: -50px;
            left: -50px;
        }

        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.25rem;
            }
            .hero-description {
                font-size: 1.125rem;
            }
            .waitlist-container {
                padding: 2rem;
            }
            .waitlist-title {
                font-size: 1.5rem;
            }
        }

        @media (max-width: 480px) {
            .hero-title {
                font-size: 2rem;
            }
            .waitlist-container {
                padding: 1.5rem;
            }
        }
    </style>

    <main class="min-h-screen">
        <div class="flex-1">
            <div class="text-center max-w-3xl mx-auto w-full">
                <h1 class="hero-title">
                    ${heroTitle}
                </h1>
                <p class="hero-description">
                    ${heroDescription}
                </p>

                <div class="waitlist-container">
                    <div class="floating-shapes">
                        <div class="shape shape-1"></div>
                        <div class="shape shape-2"></div>
                    </div>
                    <h2 class="waitlist-title">${waitlistTitle}</h2>
                    <p class="waitlist-offer">${waitlistOffer}</p>
                    <form class="waitlist-form">
                        <div class="form-group">
                            <label for="name" class="form-label">Nombre completo</label>
                            <input type="text" id="name" class="form-input" placeholder="Tu nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="email" class="form-label">Correo electrónico</label>
                            <input type="email" id="email" class="form-input" placeholder="tu@email.com" required>
                        </div>
                        <button type="submit" class="form-button">
                            <i class="fas fa-paper-plane"></i>
                            Unirme a la lista
                        </button>
                    </form>
                    <div class="success-message" style="display: none;">
                        ¡Gracias por unirte! Te hemos enviado un correo de confirmación.
                    </div>
                </div>
            </div>
        </div>
        <footer>
            <p>&copy; ${year} ${heroTitle}. Todos los derechos reservados.</p>
        </footer>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
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

                try {
                    var res = await fetch('/api/waitlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ slug: '${slug}', name, email }),
                    });

                    if (res.ok) {
                        form.style.display = 'none';
                        successMessage.style.display = 'block';
                    } else {
                        console.error('Error al enviar el formulario');
                    }
                } catch (error) {
                    console.error('Error al enviar el formulario:', error);
                }
            });
        });
    </script>
  `;
}

export default async function Landing({ params }: any) {
  const { data, error } = await supabase
    .from("ideas")
    .select("landing")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    return <div className="p-10 text-center">Landing no encontrada</div>;
  }

  const landing = (data as any).landing;

  return <div dangerouslySetInnerHTML={{ __html: buildHtml(landing, params.slug) }} />;
}