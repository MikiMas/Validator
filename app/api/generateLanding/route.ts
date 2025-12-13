// app/api/generateLanding/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { nanoid } from "nanoid";
import { getUserFromRequest } from "@/lib/authServer";

export async function POST(req: Request) {
  try {
    const {
      mode = "landing-only",
      ideaName,
      ideaDescription,
      waitlistOffer,
      landingTitle,
      landingDescription,
      landingWaitlistText,
      landingTheme = "dark",
      customSlug,
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

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    const isCombo = mode === "combo";

    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    if (!ideaName || !ideaDescription) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos: ideaName o ideaDescription" },
        { status: 400 }
      );
    }

    const baseSlug =
      (customSlug || ideaName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || nanoid(6);

    // Evitar duplicados: si el slug existe, devolver error (solo cuando el usuario lo elige)
    const desiredSlug = customSlug ? baseSlug : `${baseSlug}-${nanoid(4)}`;
    if (customSlug) {
      const { data: existing, error: existError } = await supabase
        .from("ideas")
        .select("slug")
        .eq("slug", desiredSlug)
        .single();

      const notFound = existError && (existError.code === "PGRST116" || existError.code === "PGRST106");

      if (existError && !notFound) {
        console.error("Error comprobando slug existente:", existError);
        return NextResponse.json(
          { success: false, error: "No se pudo verificar la disponibilidad del slug" },
          { status: 500 }
        );
      }

      if (existing) {
        return NextResponse.json(
          { success: false, error: "La URL ya está en uso, elige otra" },
          { status: 409 }
        );
      }
    }

    const slug = desiredSlug;

    // Contenido basado exactamente en lo escrito por el usuario (sin IA)
    const normalizedTheme = landingTheme === "light" ? "light" : "dark";
    const landingContent = {
      heroTitle: landingTitle || ideaName,
      heroDescription: landingDescription || ideaDescription,
      waitlistTitle: landingWaitlistText || "Únete a la lista de espera",
      waitlistOffer: waitlistOffer || "",
      theme: normalizedTheme
    };

    // Guardar en Supabase (tabla 'ideas')
    const ideaRecord: Record<string, any> = {
      slug,
      idea_name: ideaName,
      idea_description: ideaDescription,
      landing: landingContent,
      user_id: authUser.id,
      created_at: new Date().toISOString()
    };

    if (isCombo && campaignSettings) {
      ideaRecord.campaign_settings = campaignSettings;
    }

    if (isCombo && (adHeadline || adMessage || adPicture)) {
      ideaRecord.ad_creative = {
        headline: adHeadline,
        message: adMessage,
        picture: adPicture
      };
    }

    const { data: insertedIdea, error } = await supabase.from("ideas").insert(ideaRecord);

    if (error) {
      console.error("Error inserting idea in Supabase", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Si se proporcionaron datos de campaña, crear el anuncio automáticamente
    let adData = null;
    if (isCombo && campaignSettings && adHeadline) {
      try {
        const adRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/createMetaAd`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authHeader ? { Authorization: authHeader } : {})
            },
            body: JSON.stringify({
              url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${slug}`,
              projectName: ideaName,
              picture: adPicture,
              message: adMessage,
              adName: `Ad - ${ideaName}`,
              callToActionType: "SIGN_UP",
              campaignSettings: campaignSettings
            })
          }
        );

        if (adRes.ok) {
          adData = await adRes.json();

          // Actualizar la idea con el ID del anuncio
          await supabase.from("ideas").update({ ad_id: adData.adId }).eq("slug", slug);
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
