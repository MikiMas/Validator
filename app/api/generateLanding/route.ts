// app/api/generateLanding/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabaseClient";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { 
      ideaName, 
      ideaDescription, 
      waitlistOffer, 
      userId,
      // Campaign settings
      campaignSettings = {
        durationDays: 7,
        dailyBudget: 5,
        totalBudget: 35
      },
      // Ad creative
      adHeadline,
      adMessage,
      adPicture
    } = await req.json();

    if (!ideaName || !ideaDescription) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos: ideaName o ideaDescription" },
        { status: 400 }
      );
    }

    // Generar slug único
    const slug = ideaName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      + "-" + nanoid(4);

    // PROMPT IA
    const prompt = `
Actúa como un experto en copywriting para landing pages minimalistas de validación (MVP).
Tu objetivo es crear el contenido para una landing muy simple que busca captar emails para una waitlist.

DATOS DEL PROYECTO (texto escrito por el usuario, NO inventes información adicional):
- Nombre: ${ideaName}
- Descripción libre del usuario: ${ideaDescription}
- Oferta para la Waitlist: ${waitlistOffer} (Ej: "50% descuento", "Acceso anticipado", etc.)

PRIMERO, interpreta la descripción del usuario como una explicación del problema que resuelve, para quién es y cómo lo soluciona.
Si hay partes ambiguas, NO rellenes con detalles inventados: mantén la descripción general.

INSTRUCCIONES DE ESTILO:
- Sé directo, claro y persuasivo.
- Estilo "Serious SaaS": profesional, minimalista, sin florituras.
- Usa solo la información que aparece en los datos del proyecto.
- No inventes funcionalidades, promesas ni detalles técnicos que el usuario no haya mencionado explícitamente.

SALIDA:
Genera un JSON con EXACTAMENTE esta estructura y sin texto adicional fuera del JSON:
{
  "heroTitle": "",          // Título principal (H1) - Impactante y claro, basado SOLO en los datos
  "heroDescription": "",    // Descripción (P) - Explicación completa pero concisa de qué hace, para quién es y por qué debería apuntarse a la waitlist (3-6 frases, sin inventar información)
  "waitlistTitle": "",      // Título de la sección de waitlist (Ej: "Únete a la lista de espera")
  "waitlistOffer": ""       // Texto persuasivo sobre la oferta, sin añadir beneficios que no se mencionen
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "system", content: prompt }],
    });

    const jsonText = completion.choices[0].message.content!;
    const landingContent = JSON.parse(jsonText);

    // Guardar en Supabase (tabla 'ideas')
    const { data: insertedIdea, error } = await supabase
      .from("ideas")
      .insert({
        slug,
        idea_name: ideaName,
        idea_description: ideaDescription,
        landing: landingContent,
        user_id: userId,
        created_at: new Date().toISOString(),
        // Guardar configuración de campaña
        campaign_settings: campaignSettings,
        ad_creative: {
          headline: adHeadline,
          message: adMessage,
          picture: adPicture
        }
      });

    if (error) {
      console.error("Error inserting idea in Supabase", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Si se proporcionaron datos de campaña, crear el anuncio automáticamente
    let adData = null;
    if (campaignSettings && adHeadline) {
      try {
        const adRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/createMetaAd`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${slug}`,
            projectName: ideaName,
            picture: adPicture,
            message: adMessage,
            adName: `Ad - ${ideaName}`,
            callToActionType: "SIGN_UP",
            campaignSettings: campaignSettings
          })
        });
        
        if (adRes.ok) {
          adData = await adRes.json();
          
          // Actualizar la idea con el ID del anuncio
          await supabase
            .from("ideas")
            .update({ ad_id: adData.adId })
            .eq("slug", slug);
        }
      } catch (adError) {
        console.error("Error creating ad:", adError);
        // No fallamos toda la operación si el anuncio falla
      }
    }

    return NextResponse.json({
      success: true,
      slug,
      adData
    });
  } catch (err: any) {
    console.error("Error en /api/generateLanding", err);
    const message = err?.message || "Error interno en generateLanding";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
