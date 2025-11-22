"use client";

import { useAuth } from "./AuthContext";

function LandingPublica() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validator - Valida tu idea de startup en minutos</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-dark: #4338ca;
            --secondary: #0f172a;
            --light: #f8fafc;
            --gray: #64748b;
            --gray-light: #cbd5e1;
            --success: #10b981;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        body {
            background-color: var(--light);
            color: var(--secondary);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header */
        header {
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--primary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .nav-links {
            display: flex;
            gap: 30px;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--secondary);
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        .nav-buttons {
            display: flex;
            gap: 15px;
        }
        
        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
            display: inline-block;
            text-align: center;
        }
        
        .btn-primary {
            background-color: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--primary-dark);
        }
        
        .btn-secondary {
            background-color: transparent;
            color: var(--secondary);
            border: 1px solid var(--gray-light);
        }
        
        .btn-secondary:hover {
            background-color: rgba(0, 0, 0, 0.03);
        }
        
        /* Hero Section */
        .hero {
            padding: 100px 0;
            background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 20px;
            line-height: 1.2;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: var(--gray);
            max-width: 700px;
            margin: 0 auto 40px;
        }
        
        .hero-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-bottom: 30px;
        }
        
        .hero-image {
            max-width: 900px;
            margin: 50px auto 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .hero-image img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        /* Features Section */
        .features {
            padding: 100px 0;
            background-color: white;
        }
        
        .section-header {
            text-align: center;
            margin-bottom: 70px;
        }
        
        .section-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 15px;
        }
        
        .section-header p {
            font-size: 1.1rem;
            color: var(--gray);
            max-width: 600px;
            margin: 0 auto;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
        }
        
        .feature-card {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background-color: rgba(79, 70, 229, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .feature-icon i {
            font-size: 1.5rem;
            color: var(--primary);
        }
        
        .feature-card h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 15px;
        }
        
        .feature-card p {
            color: var(--gray);
        }
        
        /* How It Works */
        .how-it-works {
            padding: 100px 0;
            background-color: #f8fafc;
        }
        
        .steps {
            display: flex;
            justify-content: space-between;
            max-width: 900px;
            margin: 0 auto;
            position: relative;
        }
        
        .steps::before {
            content: '';
            position: absolute;
            top: 40px;
            left: 10%;
            right: 10%;
            height: 2px;
            background-color: var(--gray-light);
            z-index: 1;
        }
        
        .step {
            text-align: center;
            position: relative;
            z-index: 2;
            flex: 1;
            padding: 0 15px;
        }
        
        .step-number {
            width: 80px;
            height: 80px;
            background-color: white;
            border: 2px solid var(--gray-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
        }
        
        .step h3 {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .step p {
            color: var(--gray);
        }
        
        /* Testimonials */
        .testimonials {
            padding: 100px 0;
            background-color: white;
        }
        
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        
        .testimonial-card {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #f1f5f9;
        }
        
        .testimonial-text {
            font-style: italic;
            margin-bottom: 20px;
            color: var(--gray);
        }
        
        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .author-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--gray-light);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
        }
        
        .author-info h4 {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .author-info p {
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        /* CTA Section */
        .cta {
            padding: 100px 0;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            text-align: center;
        }
        
        .cta h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 20px;
        }
        
        .cta p {
            font-size: 1.2rem;
            max-width: 600px;
            margin: 0 auto 40px;
            opacity: 0.9;
        }
        
        .cta-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .btn-light {
            background-color: white;
            color: var(--primary);
        }
        
        .btn-light:hover {
            background-color: #f1f5f9;
        }
        
        .btn-outline-light {
            background-color: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .btn-outline-light:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Footer */
        footer {
            background-color: var(--secondary);
            color: white;
            padding: 70px 0 30px;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 40px;
            margin-bottom: 50px;
        }
        
        .footer-column h3 {
            font-size: 1.2rem;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .footer-links {
            list-style: none;
        }
        
        .footer-links li {
            margin-bottom: 10px;
        }
        
        .footer-links a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-links a:hover {
            color: white;
        }
        
        .footer-bottom {
            border-top: 1px solid #334155;
            padding-top: 30px;
            text-align: center;
            color: #94a3b8;
            font-size: 0.9rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .navbar {
                flex-direction: column;
                gap: 20px;
            }
            
            .nav-links {
                gap: 20px;
            }
            
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero-buttons, .cta-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .steps {
                flex-direction: column;
                gap: 40px;
            }
            
            .steps::before {
                display: none;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container">
            <nav class="navbar">
                <a href="#" class="logo">
                    <i class="fas fa-chart-line"></i>
                    Validator
                </a>
                <div class="nav-links">
                    <a href="#features">Características</a>
                    <a href="#how-it-works">Cómo funciona</a>
                    <a href="#testimonials">Testimonios</a>
                </div>
                <div class="nav-buttons">
                    <a href="/login" class="btn btn-secondary">Iniciar sesión</a>
                    <a href="/register" class="btn btn-primary">Crear cuenta</a>
                </div>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>Valida tu idea de startup en minutos</h1>
            <p>Nuestra plataforma te ayuda a crear una landing page y anuncios en Meta para testear tu idea tecnológica antes de invertir tiempo y recursos en desarrollo.</p>
            <div class="hero-buttons">
                <a href="/register" class="btn btn-primary">Comenzar ahora</a>
                <a href="#how-it-works" class="btn btn-secondary">Ver cómo funciona</a>
            </div>
            <div class="hero-image">
                <!-- Placeholder for dashboard image -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 400px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">
                    Vista previa del dashboard de Validator
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="container">
            <div class="section-header">
                <h2>Todo lo que necesitas para validar tu idea</h2>
                <p>Nuestra plataforma combina herramientas poderosas con una interfaz simple para que puedas enfocarte en lo que importa: tu idea.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3>Landing Page Instantánea</h3>
                    <p>Crea una landing page profesional en minutos sin necesidad de conocimientos técnicos. Solo describe tu idea y nosotros hacemos el resto.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-bullhorn"></i>
                    </div>
                    <h3>Campañas en Meta</h3>
                    <p>Genera anuncios optimizados para Facebook e Instagram que te ayudarán a llegar a tu audiencia objetivo y medir el interés real.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3>Métricas Claras</h3>
                    <p>Obtén datos concretos sobre el interés en tu idea: visitas, conversiones, tiempo en página y más para tomar decisiones informadas.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works" id="how-it-works">
        <div class="container">
            <div class="section-header">
                <h2>Así de simple es validar tu idea</h2>
                <p>En solo tres pasos podrás tener tu idea en el mercado y recibir feedback real de potenciales clientes.</p>
            </div>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <h3>Describe tu idea</h3>
                    <p>Completa nuestro formulario intuitivo con los detalles de tu startup o producto.</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <h3>Genera tu landing</h3>
                    <p>Nuestra plataforma crea automáticamente una landing page profesional.</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <h3>Lanza y analiza</h3>
                    <p>Publica tu landing y campañas en Meta, luego analiza los resultados.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials" id="testimonials">
        <div class="container">
            <div class="section-header">
                <h2>Lo que dicen nuestros emprendedores</h2>
                <p>Miles de ideas han sido validadas usando nuestra plataforma.</p>
            </div>
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <p class="testimonial-text">"Validator me ayudó a confirmar que mi aplicación tenía mercado real antes de invertir en desarrollo. Ahorré meses de trabajo y miles de dólares."</p>
                    <div class="testimonial-author">
                        <div class="author-avatar" style="background-color: #4f46e5;">AM</div>
                        <div class="author-info">
                            <h4>Ana Martínez</h4>
                            <p>Fundadora de FitTrack</p>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p class="testimonial-text">"En solo 48 horas pude validar mi idea y recibir más de 200 suscripciones de interés. La plataforma es increíblemente fácil de usar."</p>
                    <div class="testimonial-author">
                        <div class="author-avatar" style="background-color: #10b981;">CR</div>
                        <div class="author-info">
                            <h4>Carlos Rodríguez</h4>
                            <p>Creador de EcoBox</p>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p class="testimonial-text">"Los datos que obtuve me ayudaron a pivotar mi idea inicial hacia algo que realmente resuena con mi audiencia. ¡Invaluable!"</p>
                    <div class="testimonial-author">
                        <div class="author-avatar" style="background-color: #f59e0b;">LG</div>
                        <div class="author-info">
                            <h4>Laura González</h4>
                            <p>CEO de LearnLingua</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
        <div class="container">
            <h2>¿Listo para validar tu idea?</h2>
            <p>Únete a miles de emprendedores que están tomando decisiones informadas sobre sus startups.</p>
            <div class="cta-buttons">
                <a href="/register" class="btn btn-light">Comenzar gratis</a>
                <a href="#features" class="btn btn-outline-light">Saber más</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-column">
                    <h3>Validator</h3>
                    <p style="color: #94a3b8; margin-bottom: 20px;">La plataforma líder para validar ideas de startups de forma rápida y efectiva.</p>
                </div>
                <div class="footer-column">
                    <h3>Enlaces</h3>
                    <ul class="footer-links">
                        <li><a href="#">Inicio</a></li>
                        <li><a href="#features">Características</a></li>
                        <li><a href="#how-it-works">Cómo funciona</a></li>
                        <li><a href="#testimonials">Testimonios</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Legal</h3>
                    <ul class="footer-links">
                        <li><a href="#">Términos de servicio</a></li>
                        <li><a href="#">Política de privacidad</a></li>
                        <li><a href="#">Cookies</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Contacto</h3>
                    <ul class="footer-links">
                        <li><a href="mailto:soporte@validator.com">soporte@validator.com</a></li>
                        <li><a href="#">Twitter</a></li>
                        <li><a href="#">LinkedIn</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2023 Validator. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
</body>
</html>`
      }}
    />
  );
}

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
    return <LandingPublica />;
  }

  return <FormularioValidator />;
}
