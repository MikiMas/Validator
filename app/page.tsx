"use client";

import { useAuth } from "./AuthContext";

function FormularioValidator() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Startup Validator | Valida tu idea tecnológica</title>

    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #f59e0b;
            --accent: #10b981;
            --danger: #ef4444;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --bg-light: #f8fafc;
            --white: #ffffff;
            --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 20px 50px -12px rgba(0, 0, 0, 0.25);
            --radius: 16px;
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            background: var(--gradient);
            min-height: 100vh;
            padding: 1rem;
        }

        .container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 2rem);
        }

        .form-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: var(--radius);
            padding: 3rem;
            width: 100%;
            max-width: 800px;
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 70px;
            background: var(--gradient);
            border-radius: 50%;
            margin-bottom: 1.5rem;
            font-size: 1.75rem;
            color: white;
            box-shadow: var(--shadow);
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: var(--text-light);
            font-size: 1.125rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .full-width {
            grid-column: 1 / -1;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--text-dark);
            font-size: 0.95rem;
        }

        .input-wrapper {
            position: relative;
        }

        input, textarea, select {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 1rem;
            transition: var(--transition);
            background-color: var(--white);
        }

        textarea {
            min-height: 120px;
            resize: vertical;
        }

        select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1.5rem;
        }

        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-light);
        }

        textarea + .input-icon {
            top: 1.25rem;
            transform: none;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .checkbox-group input {
            width: auto;
        }

        .progress-bar {
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            margin: 2rem 0;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            background: var(--accent);
            width: 0%;
            border-radius: 3px;
            transition: width 0.5s ease;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            padding: 1.25rem 2rem;
            background: var(--gradient);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.125rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            box-shadow: var(--shadow);
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
        }

        .btn i {
            font-size: 1.25rem;
        }

        .features {
            display: flex;
            justify-content: space-between;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
        }

        .feature {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.5rem;
        }

        .feature-icon {
            width: 50px;
            height: 50px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 1.25rem;
        }

        .feature-text {
            font-size: 0.875rem;
            color: var(--text-light);
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }

            .form-card {
                padding: 2rem 1.5rem;
            }

            h1 {
                font-size: 2rem;
            }

            .features {
                flex-direction: column;
                gap: 1.5rem;
            }
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="form-card">
            <div class="header">
                <div class="logo">
                    <i class="fas fa-rocket"></i>
                </div>
                <h1>Valida tu Startup</h1>
                <p class="subtitle">Completa el formulario y genera una landing page profesional con IA</p>
            </div>

            <div class="progress-bar">
                <div class="progress"></div>
            </div>

            <form id="startup-form">
                <div class="form-grid">

                    <div class="form-group full-width">
                        <label for="projectName">Nombre del Proyecto *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-lightbulb input-icon"></i>
                            <input type="text" id="projectName" placeholder="Ej: EcoTrack, HealthMonitor..." required>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="basicDescription">Descripción básica *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-align-left input-icon"></i>
                            <textarea id="basicDescription" placeholder="Describe brevemente tu idea o producto..." required></textarea>
                        </div>
                    </div>

                </div>

                <button type="submit" class="btn">
                    <i class="fas fa-magic"></i>
                    Generar Landing Page con IA
                </button>
            </form>

            <hr style="margin: 2.5rem 0; border: none; border-top: 1px solid #e5e7eb;" />

            <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-dark);">Crear anuncio en Meta</h2>

            <form id="meta-ad-form">
                <div class="form-grid">

                    <div class="form-group full-width">
                        <label for="adUrl">URL destino del anuncio *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-link input-icon"></i>
                            <input type="url" id="adUrl" placeholder="https://tulanding.com" required>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="adProjectName">Nombre del proyecto para el anuncio *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-bullhorn input-icon"></i>
                            <input type="text" id="adProjectName" placeholder="Nombre interno del proyecto" required>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="adMessage">Texto del anuncio *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-comment-dots input-icon"></i>
                            <textarea id="adMessage" placeholder="Texto principal del anuncio" required></textarea>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="adPicture">URL de la imagen (picture) *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-image input-icon"></i>
                            <input type="url" id="adPicture" placeholder="https://tusitio.com/imagen.png" required>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="adsetId">Ad Set ID existente *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-layer-group input-icon"></i>
                            <input type="text" id="adsetId" placeholder="ID del ad set ya creado en Meta" required>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="adName">Nombre interno del Ad *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-ad input-icon"></i>
                            <input type="text" id="adName" placeholder="Ej: Anuncio prueba campaña 1" required>
                        </div>
                    </div>

                </div>

                <button type="submit" class="btn">
                    <i class="fas fa-bullseye"></i>
                    Crear AdCreative + Ad
                </button>
            </form>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <span class="feature-text">Generación en 60 segundos</span>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <span class="feature-text">Métricas de conversión</span>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <span class="feature-text">Diseño responsive</span>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <span class="feature-text">Datos seguros</span>
                </div>
            </div>

        </div>
    </div>


    <script>
        const form = document.getElementById('startup-form');
        const metaAdForm = document.getElementById('meta-ad-form');
        const inputs = document.querySelectorAll('input, textarea, select');
        const progressBar = document.querySelector('.progress');

        inputs.forEach(function(input) {
            input.addEventListener('input', updateProgress);
        });

        function updateProgress() {
            const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
            const totalFields = requiredFields.length;
            let completed = 0;

            requiredFields.forEach(function(field) {
                if (field.value.trim() !== '') {
                    completed++;
                }
            });

            const progress = (completed / totalFields) * 100;
            progressBar.style.width = progress + '%';
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando tu landing...';
            btn.disabled = true;

            const projectName = document.getElementById('projectName').value;
            const basicDescription = document.getElementById('basicDescription').value;

            const ideaName = projectName;
            const ideaDescription = basicDescription;

            try {
                const response = await fetch('/api/generateLanding', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ideaName: ideaName,
                        ideaDescription: ideaDescription
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al generar la landing');
                }

                const data = await response.json();

                if (data && data.slug) {
                    window.location.href = '/' + data.slug;
                } else {
                    alert('No se pudo obtener la URL de la landing generada.');
                }
            } catch (error) {
                console.error(error);
                alert('Ha ocurrido un error al generar la landing. Inténtalo de nuevo.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        metaAdForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando anuncio...';
            btn.disabled = true;

            const adUrl = document.getElementById('adUrl').value;
            const adProjectName = document.getElementById('adProjectName').value;
            const adMessage = document.getElementById('adMessage').value;
            const adPicture = document.getElementById('adPicture').value;
            const adsetId = document.getElementById('adsetId').value;
            const adName = document.getElementById('adName').value;

            try {
                const response = await fetch('/api/createMetaAd', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: adUrl,
                        projectName: adProjectName,
                        picture: adPicture,
                        adsetId: adsetId,
                        message: adMessage,
                        adName: adName
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    console.error('Error Meta API:', errorData);
                    throw new Error('Error al crear el anuncio en Meta');
                }

                const data = await response.json();

                if (data && data.adId) {
                    alert('Anuncio creado correctamente. ID del Ad: ' + data.adId);
                } else {
                    alert('Se ha creado algo en Meta pero no se encontró el ID del anuncio en la respuesta. Revisa la consola.');
                    console.log('Respuesta completa Meta:', data);
                }
            } catch (error) {
                console.error(error);
                alert('Ha ocurrido un error al crear el anuncio. Inténtalo de nuevo.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    </script>

</body>
</html>
        `,
      }}
    />
  );
}

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold">Validator</h1>
          <p className="text-lg text-slate-300">
            Crea una landing y un anuncio en Meta para validar tu idea tecnológica en minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold"
            >
              Iniciar sesión
            </a>
            <a
              href="/register"
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold border border-slate-600"
            >
              Crear cuenta
            </a>
          </div>
          <p className="text-sm text-slate-400">
            Una vez dentro verás el formulario para describir tu idea y generar la landing.
          </p>
        </div>
      </main>
    );
  }

  return <FormularioValidator />;
}
