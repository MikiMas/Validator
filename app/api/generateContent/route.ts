import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authServer';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { projectDescription, projectName } = await request.json();

    if (!projectDescription || !projectName) {
      return NextResponse.json(
        { error: 'Se requieren la descripción del proyecto y el nombre del proyecto' },
        { status: 400 }
      );
    }

    // Prompt para generar contenido de landing page
    const landingPrompt = `Eres un experto copywriter especializado en landing pages que convierten para startups.

Basado en esta descripción del proyecto:
"${projectDescription}"

Nombre del proyecto (referencia interna): "${projectName}"

Analiza a fondo el proyecto y genera contenido que comunique CLARAMENTE la propuesta de valor única.

Identifica:
1. El PROBLEMA específico que resuelve
2. La SOLUCIÓN única que ofrece  
3. El BENEFICIO principal para el usuario
4. ¿Por qué es MEJOR que las alternativas existentes?

Genera contenido para una landing page minimalista y efectiva:

1. **Título Principal**: Debe comunicar el BENEFICIO principal, no el nombre del proyecto
   - BAD: "Bienvenido a MiApp", "La Solución Definitiva"
   - GOOD: "Reduce Tiempo 50%", "Facturación Automática", "Sin Más Deudores"
   - Máximo 60 caracteres

2. **Descripción**: Explica CLARAMENTE el problema y solución única
   - Enfócate en el RESULTADO para el usuario
   - Usa números específicos si es posible
   - Menciona por qué es diferente/mejor
   - 150-200 caracteres

3. **Oferta Waitlist**: Oferta irresistible que refleje el valor real
   - Ejemplos: "Acceso anticipado + 30% descuento", "Prueba gratis 6 meses"
   - Debe ser relevante al beneficio principal

Responde ÚNICAMENTE en formato JSON:
{
  "ideaName": "Beneficio principal como título",
  "ideaDescription": "Descripción enfocada en valor",
  "waitlistOffer": "Oferta relevante al beneficio"
}

EJEMPLOS por tipo de proyecto:
- SaaS B2B: "Automatiza Facturación", "Reduce costes operativos 40%", "Demo gratis + 20% descuento"
- App Productividad: "Recupera 10h/semana", "Organiza tu vida en 5 min/día", "Acceso anticipado premium"
- Marketplace: "Precios 35% más baratos", "Sin comisiones ocultas nunca", "Registro gratis + envío gratis"
- Educativo: "Aprende 3x más rápido", "Certificado en 2 semanas", "Primer curso gratis + 50% descuento"`;

    // Prompt para generar contenido del anuncio
    const adPrompt = `Eres un experto en publicidad digital de Meta Ads especializado en crear anuncios que convierten.

Basado en esta descripción del proyecto:
"${projectDescription}"

Nombre del proyecto: "${projectName}"

Analiza a fondo el proyecto y crea un anuncio que destaque SU PROPIA PROPOSICIÓN DE VALOR ÚNICA. NO uses frases genéricas.

Identifica:
1. El PROBLEMA específico que resuelve
2. La SOLUCIÓN única que ofrece
3. El BENEFICIO principal para el usuario
4. ¿Por qué es MEJOR que las alternativas?

Genera contenido para un anuncio efectivo y ESPECÍFICO:

1. **Headline**: Título que comunique el beneficio principal (máximo 30 caracteres)
   - Ejemplos BAD: "Descubre MiApp", "Innovación Tech"
   - Ejemplos GOOD: "Reduce Costes 50%", "Automatiza Facturación", "Sin Más Deudores"

2. **Mensaje**: Texto que explique CLARAMENTE la propuesta de valor (máximo 125 caracteres)
   - Enfócate en el RESULTADO, no en la característica
   - Usa números específicos si es posible
   - Menciona el problema que resuelve

3. **Imagen**: URL de una imagen de stock compatible con Meta Ads
   - Debe representar el BENEFICIO final, no la tecnología
   - Usa imágenes de personas si es B2C, negocios si es B2B

Para la imagen, usa URLs de Pexels o Pixabay con este formato:
https://images.pexels.com/photos/[ID]/[descripcion].jpg

Responde ÚNICAMENTE en formato JSON:
{
  "adHeadline": "Beneficio específico aquí",
  "adMessage": "Propuesta de valor clara aquí",
  "adPicture": "URL imagen aquí"
}

EJEMPLOS:
- Si es app de gestión: "Gana 10h/semana", "Recupera tiempo perdido"
- Si es SaaS B2B: "Reduce costes 30%", "Facturación automática"
- Si es marketplace: "Precios 40% más baratos", "Sin comisiones ocultas"
- Si es educativo: "Aprende 3x más rápido", "Certificado en 2 semanas"`;

    // Llamadas a OpenAI
    const [landingResponse, adResponse] = await Promise.all([
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: landingPrompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }),
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: adPrompt }],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }),
    ]);

    if (!landingResponse.ok || !adResponse.ok) {
      throw new Error('Error al generar contenido con IA');
    }

    const [landingData, adData] = await Promise.all([
      landingResponse.json(),
      adResponse.json(),
    ]);

    // Parsear respuestas
    let landingContent, adContent;
    
    try {
      landingContent = JSON.parse(landingData.choices[0].message.content);
    } catch (e) {
      // Fallback si JSON no es válido - más específico basado en el proyecto
      const description = projectDescription.substring(0, 150);
      landingContent = {
        ideaName: `Solución para ${projectName}`,
        ideaDescription: description,
        waitlistOffer: "Acceso anticipado con beneficios exclusivos"
      };
    }

    try {
      adContent = JSON.parse(adData.choices[0].message.content);
    } catch (e) {
      // Fallback si JSON no es válido - más específico basado en el proyecto
      adContent = {
        adHeadline: `Resuelve tu problema`,
        adMessage: `La solución específica que necesitas. Regístrate ahora.`,
        adPicture: "https://images.pexels.com/photos/3184418/pexels-photo.jpg"
      };
    }

    return NextResponse.json({
      landingContent: {
        ...landingContent,
        sections: [] // Se pueden añadir secciones adicionales si se necesita
      },
      adContent
    });

  } catch (error: any) {
    console.error('Error en generateContent:', error);
    
    // Fallback básico si todo falla
    return NextResponse.json({
      landingContent: {
        ideaName: "Solución para tu proyecto",
        ideaDescription: "La solución específica que necesitas",
        waitlistOffer: "Acceso anticipado con beneficios exclusivos",
        sections: []
      },
      adContent: {
        adHeadline: "Resuelve tu problema ahora",
        adMessage: "La solución específica que buscas. Regístrate gratis.",
        adPicture: "https://images.pexels.com/photos/3184418/pexels-photo.jpg"
      }
    });
  }
}
