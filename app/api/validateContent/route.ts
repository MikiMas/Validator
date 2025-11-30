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

    const body = await request.json();
    const title = body.title ?? body.projectName;
    const description = body.description ?? body.projectDescription;
    const waitlistText: string | undefined = body.waitlistText;
    const offerText: string | undefined = body.offerText;

    // Validación básica de entrada
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'El título y la descripción del proyecto son requeridos' },
        { status: 400 }
      );
    }

    if (description.trim().length < 40) {
      return NextResponse.json(
        { error: 'La descripción debe tener al menos 40 caracteres' },
        { status: 400 }
      );
    }

    const hasWaitlistOffer = Boolean(offerText && offerText.trim().length > 0);

    // Validación con IA usando OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const prompt = `
Actúa como un moderador de contenido experto que protege la reputación de una marca. Analiza el siguiente contenido de proyecto y determina si es apropiado, legal y seguro para usar en una landing page.

NOMBRE DEL PROYECTO: "${title}"
DESCRIPCIÓN DEL PROYECTO: "${description}"
INCLUYE OFERTA DE WAITLIST: ${hasWaitlistOffer ? 'Sí' : 'No'}

Evalúa el contenido basándote en estos criterios:

1. CONTENIDO INAPROPIADO:
   - Contenido para adultos, sexual o explícito
   - Violencia, odio, discriminación o acoso
   - Drogas ilegales, alcohol o tabaco (si está dirigido a menores)
   - Apuestas o juegos de azar
   - Contenido terrorista o extremista
   - Autolesión o suicidio

2. CONTENIDO ILEGAL O ENGAÑOSO:
   - Actividades ilegales o fraudulentas
   - Estafas, esquemas piramidales o phishing
   - Falsificación de documentos o productos
   - Venta de bienes robados o contrabando
   - Contenido que viola derechos de autor o propiedad intelectual

3. CONTENIDO DAÑINO O PELIGROSO:
   - Armas, explosivos o material peligroso
   - Sustancias químicas peligrosas
   - Medicamentos sin receta o sustancias controladas
   - Consejos médicos peligrosos o no verificados
   - Contenido que promueve comportamientos arriesgados

4. CONTENIDO QUE DAÑA LA REPUTACIÓN:
   - Lenguaje ofensivo, vulgar o inapropiado
   - Contenido políticamente extremista o divisivo
   - Religión extremista o proselitista agresivo
   - Teorías de conspiración o desinformación
   - Contenido que podría generar backlash público

5. CONTENIDO COMERCIAL INAPROPIADO:
   - Promesas falsas o engañosas
   - Esquemas de "hacerse rico rápido"
   - Medicamentos milagrosos o curas falsas
   - Servicios financieros no regulados
   - Productos de baja calidad o estafas

Responde ÚNICAMENTE en formato JSON:
{
  "valid": true/false,
  "reason": "Explicación clara y concisa de por qué el contenido no es válido (solo si valid=false)",
  "category": "categoría del problema (solo si valid=false)",
  "suggestion": "sugerencia para mejorar el contenido (opcional)"
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto moderador de contenido que responde únicamente en formato JSON válido. No incluyas ningún texto adicional fuera del JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en API de OpenAI:', errorData);
      return NextResponse.json(
        { error: 'Error al validar el contenido con IA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    let validationResult;
    try {
      validationResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parseando respuesta de IA:', aiResponse);
      // Si no puede parsear, asume que es válido pero con advertencia
      return NextResponse.json({
        valid: true,
        reason: 'Validación básica pasada (no se pudo verificar con IA)'
      });
    }

    // Validación adicional de palabras clave explícitas
    const forbiddenKeywords = [
      // Contenido para adultos
      'porn', 'sexo', 'sexual', 'xxx', 'adulto', 'erótico',
      // Drogas
      'droga', 'cocaína', 'heroína', 'marihuana', 'porro',
      // Violencia/ilegal
      'terrorista', 'bomba', 'arma', 'asesinar', 'matar',
      // Estafas
      'estafa', 'fraude', 'pirámide', 'dinero fácil', 'rico rápido',
      // Medicamentos falsos
      'milagroso', 'cura instantánea', 'píldora mágica'
    ];

    const lowerDescription = description.toLowerCase();
    const lowerName = title.toLowerCase();
    const hasForbiddenKeyword = forbiddenKeywords.some(keyword => 
      lowerDescription.includes(keyword) || lowerName.includes(keyword)
    );

    if (hasForbiddenKeyword) {
      return NextResponse.json({
        valid: false,
        reason: 'El contenido contiene palabras o términos inapropiados que podrían dañar la reputación de tu marca.',
        category: 'content_inappropriate',
        suggestion: 'Por favor, revisa y modifica el contenido para eliminar términos inapropiados.'
      });
    }

    return NextResponse.json(validationResult);

  } catch (error) {
    console.error('Error en validación de contenido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al validar el contenido' },
      { status: 500 }
    );
  }
}
