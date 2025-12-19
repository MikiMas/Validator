// app/api/generateLanding/route.ts

import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabaseClient";

import { nanoid } from "nanoid";

import { getUserFromRequest } from "@/lib/authServer";



export async function POST(req: Request) {

  try {

    const {

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

      country

    } = await req.json();



    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    const origin = new URL(req.url).origin;



    const authUser = await getUserFromRequest(req);

    if (!authUser) {

      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    }



    if (!ideaName || !ideaDescription) {

      return NextResponse.json(

        { success: false, error: "Missing required fields: ideaName or ideaDescription" },

        { status: 400 }

      );

    }



    const baseSlug =

      (customSlug || ideaName)

        .toLowerCase()

        .replace(/[^a-z0-9]+/g, "-")

        .replace(/^-+|-+$/g, "") || nanoid(6);



    // Avoid duplicates: if the slug exists, return error (only when the user chooses it)

    const desiredSlug = customSlug ? baseSlug : `${baseSlug}-${nanoid(4)}`;

    if (customSlug) {

      const { data: existing, error: existError } = await supabase

        .from("ideas")

        .select("slug")

        .eq("slug", desiredSlug)

        .single();



      const notFound = existError && (existError.code === "PGRST116" || existError.code === "PGRST106");



      if (existError && !notFound) {

        console.error("Error checking existing slug:", existError);

        return NextResponse.json(

          { success: false, error: "Could not verify slug availability" },

          { status: 500 }

        );

      }



      if (existing) {

        return NextResponse.json(

          { success: false, error: "The URL is already in use, choose another" },

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

      waitlistTitle: landingWaitlistText || "Join the waitlist",

      waitlistOffer: waitlistOffer || "",

      theme: normalizedTheme

    };



    // Save to Supabase (table 'ideas')

    const ideaRecord: Record<string, any> = {

      slug,

      idea_name: ideaName,

      idea_description: ideaDescription,

      landing: landingContent,

      user_id: authUser.id,

      created_at: new Date().toISOString()

    };



    if (campaignSettings) {

      ideaRecord.campaign_settings = campaignSettings;

    }



    if (adHeadline || adMessage) {

      ideaRecord.ad_creative = {

        headline: adHeadline,

        message: adMessage

      };

    }



    const { data: insertedIdea, error } = await supabase.from("ideas").insert(ideaRecord).select();



    if (error) {

      console.error("Error inserting idea in Supabase", error);

      return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    }



    // If campaign data is provided, create the ad automatically

    let adData = null;

    if (campaignSettings && adHeadline) {

      try {

        const adRes = await fetch(

          `${origin}/api/createMetaAd`,

          {

            method: "POST",

            headers: {

              "Content-Type": "application/json",

              ...(authHeader ? { Authorization: authHeader } : {})

            },

            body: JSON.stringify({

              url: `${origin}/${slug}`,

              projectName: ideaName,

              message: adMessage,

              adName: `Ad - ${ideaName}`,

              callToActionType: "SIGN_UP",

              campaignSettings: campaignSettings,
              country: country

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

        // We don't fail the whole operation if the ad fails

      }

    }



    return NextResponse.json({

      success: true,

      slug,

      adData

    });

  } catch (err: any) {

    console.error("Error in /api/generateLanding", err);

    const message = err?.message || "Internal error in generateLanding";

    return NextResponse.json({ success: false, error: message }, { status: 500 });

  }

}
