// app/api/generateLanding/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabaseClient";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { ideaName, ideaDescription, waitlistOffer, userId } = await req.json();

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

DATOS DEL PROYECTO:
- Nombre: ${ideaName}
- Descripción: ${ideaDescription}
- Oferta para la Waitlist: ${waitlistOffer} (Ej: "50% descuento", "Acceso anticipado", etc.)

INSTRUCCIONES:
- Sé directo, claro y persuasivo.
- Estilo "Serious SaaS": profesional, minimalista, sin florituras.
- El objetivo es que el usuario entienda qué es y quiera dejar su email.

Genera un JSON con EXACTAMENTE esta estructura:
{
  "heroTitle": "",          // Título principal (H1) - Impactante y claro
  "heroDescription": "",    // Descripción corta (P) - Qué hace y para quién es
  "waitlistTitle": "",      // Título de la sección de waitlist (Ej: "Únete a la lista de espera")
  "waitlistOffer": ""       // Texto persuasivo sobre la oferta (Ej: "Regístrate hoy y obtén un 50% de descuento...")
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
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
      });

    if (error) {
      console.error("Error inserting idea in Supabase", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slug,
    });
  } catch (err: any) {
    console.error("Error en /api/generateLanding", err);
    const message = err?.message || "Error interno en generateLanding";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
