import { db } from "@/lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import WaitlistForm from "./WaitlistForm";

export default async function Landing({ params }: any) {
  const ref = doc(db, "ideas", params.slug);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return <div className="p-10 text-center">Landing no encontrada</div>;
  }

  const idea = snap.data();
  const landing = idea.landing;

  return (
    <main className="landing-body">
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <h1>{landing.heroTitle}</h1>
          <p>{landing.heroSubtitle}</p>
          <a href="#waitlist" className="btn btn-primary">
            {landing.cta}
          </a>
        </div>
      </section>

      <WaitlistForm slug={params.slug} />

      {/* FEATURES / BENEFICIOS */}
      <section className="features">
        <div className="container">
          <div className="text-center">
            <h2>¿Por qué esta idea importa?</h2>
          </div>
          <div className="features-grid">
            {landing.benefits.map((b: string, i: number) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>{b}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="text-center">
            <h2>Cómo funciona</h2>
          </div>
          <div className="steps-container">
            {landing.howItWorks.map((step: any, i: number) => (
              <div key={i} className="step-card">
                <div className="step-number">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="text-center">
            <h2>Preguntas frecuentes</h2>
          </div>
          <div className="faq-container">
            {landing.faqs.map((f: any, i: number) => (
              <div key={i} className="faq-item">
                <div className="faq-question">{f.q}</div>
                <div className="faq-answer">
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <p>{landing.footerLine}</p>
        </div>
      </footer>
    </main>
  );
}