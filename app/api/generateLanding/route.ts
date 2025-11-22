// app/api/generateLanding/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { db } from "@/lib/firestore";
import { collection, doc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { ideaName, ideaDescription } = await req.json();

  // Generar slug único
  const slug = ideaName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-" + nanoid(4);

  // PROMPT IA
  const prompt = `
Actúa como un experto en copywriting y diseño de landing pages para startups digitales tipo SaaS.
Quiero que generes contenido MUY claro, moderno y persuasivo, adaptado a una landing minimalista y elegante.

TEN EN CUENTA ESTO:
- Usa un tono profesional, cercano y orientado a conversión.
- Evita frases vacías; sé específico sobre el problema, la solución y el valor.
- Piensa en una página tipo SaaS con secciones: hero potente, beneficios claros, pasos sencillos y FAQs útiles.

DATOS DE LA IDEA:
- Nombre del proyecto: ${ideaName}
- Descripción básica de la idea: ${ideaDescription}

Ahora genera el contenido siguiendo EXACTAMENTE este esquema JSON (no añadas ni quites campos, no añadas comentarios de texto fuera del JSON):

{
  "heroTitle": "",          // Título principal muy claro y atractivo
  "heroSubtitle": "",       // Subtítulo que explique la propuesta de valor en 1-2 frases
  "cta": "",                // Texto de un botón de acción (Ej: "Empieza ahora", "Solicitar acceso")
  "benefits": [              // 3-4 beneficios fuertes y concretos
    "",
    "",
    "",
    ""
  ],
  "howItWorks": [            // 3 pasos sencillos que expliquen cómo funciona el producto
    { "title": "", "desc": "" },
    { "title": "", "desc": "" },
    { "title": "", "desc": "" }
  ],
  "faqs": [                  // 2-4 preguntas frecuentes relevantes para alguien que está dudando si usarlo
    { "q": "", "a": "" },
    { "q": "", "a": "" }
  ],
  "footerLine": ""          // Frase corta tipo claim final o recordatorio de valor
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "system", content: prompt }]
  });

  const jsonText = completion.choices[0].message.content!;
  const landingContent = JSON.parse(jsonText);

  // Guardar en Firestore
  const ideaRef = doc(collection(db, "ideas"), slug);

  await setDoc(ideaRef, {
    slug,
    ideaName,
    ideaDescription,
    landing: landingContent,
    createdAt: new Date(),
    waitlist: []
  });

  return NextResponse.json({
    success: true,
    slug
  });
}
