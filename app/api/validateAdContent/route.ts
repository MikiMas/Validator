import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getUserFromRequest } from "@/lib/authServer";

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { adHeadline, adMessage, adPicture } = await req.json();

    if (!adHeadline || !adMessage) {
      return NextResponse.json(
        { error: 'El título y el mensaje del anuncio son requeridos' },
        { status: 400 }
      );
    }

    // Validación básica de longitud
    if (adHeadline.length > 100) {
      return NextResponse.json(
        { valid: false, reason: 'El título del anuncio es demasiado largo (máximo 100 caracteres)' },
        { status: 200 }
      );
    }

    if (adMessage.length > 300) {
      return NextResponse.json(
        { valid: false, reason: 'El mensaje del anuncio es demasiado largo (máximo 300 caracteres)' },
        { status: 200 }
      );
    }

    // Validación con IA
    const prompt = `
Actúa como un moderador de contenido experto en publicidad digital.

Analiza el siguiente contenido de anuncio para determinar si es apropiado para publicidad en redes sociales:

TÍTULO: "${adHeadline}"
MENSAJE: "${adMessage}"
${adPicture ? `IMAGEN: ${adPicture}` : ''}

Criterios de evaluación:
1. Contenido engañoso o fraudulento
2. Promesas irreales o exageradas
3. Contenido ofensivo, discriminatorio o de odio
4. Productos/servicios ilegales o regulados
5. Información médica falsa o no verificada
6. Violación de derechos de autor
7. Contenido inapropiado para audiencia general

Responde ÚNICAMENTE en formato JSON:
{
  "valid": true/false,
  "reason": "Explicación breve si no es válido"
}

Si el contenido es legítimo y apropiado, responde con {"valid": true}.
Si hay algún problema, responde con {"valid": false, "reason": "explicación"}.
`;

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no está configurada');
      // Fallback: permitir contenido básico si OpenAI no está disponible
      return NextResponse.json({ valid: true });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0].message.content;
    
    try {
      const validationResult = JSON.parse(aiResponse || '{}');
      
      if (validationResult.valid === false) {
        return NextResponse.json({
          valid: false,
          reason: validationResult.reason || 'El contenido del anuncio no es apropiado para publicidad'
        });
      }
      
      return NextResponse.json({ valid: true });
      
    } catch (parseError) {
      console.error('Error parseando respuesta de IA:', aiResponse);
      // Fallback: permitir si hay error en el parseo
      return NextResponse.json({ valid: true });
    }

  } catch (error) {
    console.error('Error en validación de contenido de anuncio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al validar el contenido' },
      { status: 500 }
    );
  }
}
