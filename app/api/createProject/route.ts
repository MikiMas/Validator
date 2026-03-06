import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getUserFromRequest } from "@/lib/authServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const body = await req.json();

    const {
      ideaName,
      ideaDescription,
      waitlistOffer,
      landingTitle,
      landingDescription,
      landingWaitlistText,
      landingTheme = "dark",
      customSlug,
      campaignSettings = { durationDays: 7, dailyBudget: 5, totalBudget: 35 },
      adHeadline,
      adMessage,
    } = body ?? {};

    if (!ideaName || !ideaDescription) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: ideaName or ideaDescription" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const baseSlug =
      (customSlug || ideaName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || nanoid(6);

    const desiredSlug = customSlug ? baseSlug : `${baseSlug}-${nanoid(4)}`;

    if (customSlug) {
      const { data: existing, error: existError } = await supabaseAdmin
        .from("ideas")
        .select("slug")
        .eq("slug", desiredSlug)
        .single();

      const notFound = existError && (existError.code === "PGRST116" || existError.code === "PGRST106");
      if (existError && !notFound) {
        return NextResponse.json({ success: false, error: "Could not verify slug availability" }, { status: 500 });
      }
      if (existing) {
        return NextResponse.json(
          { success: false, error: "The URL is already in use, choose another" },
          { status: 409 }
        );
      }
    }

    const normalizedTheme = landingTheme === "light" ? "light" : "dark";
    const landingContent = {
      heroTitle: landingTitle || ideaName,
      heroDescription: landingDescription || ideaDescription,
      waitlistTitle: landingWaitlistText || "Join the waitlist",
      waitlistOffer: waitlistOffer || "",
      theme: normalizedTheme,
    };

    const ideaId = crypto.randomUUID();

    const ideaRecord: Record<string, any> = {
      id: ideaId,
      slug: desiredSlug,
      idea_name: ideaName,
      idea_description: ideaDescription,
      landing: landingContent,
      user_id: user.id,
      created_at: new Date().toISOString(),
      campaign_settings: campaignSettings ?? null,
      ad_creative: adHeadline || adMessage ? { headline: adHeadline, message: adMessage } : null,
      ad_id: null,
      campaign_id: null,
      adset_id: null,
    };

    const { error: insertIdeaError } = await supabaseAdmin.from("ideas").insert(ideaRecord);
    if (insertIdeaError) {
      return NextResponse.json({ success: false, error: insertIdeaError.message }, { status: 500 });
    }

    const campaignRowId = nanoid(16);
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + (campaignSettings?.durationDays || 7));

    const { error: insertCampaignError } = await supabaseAdmin.from("campaigns").insert({
      id: campaignRowId,
      idea_id: ideaId,
      user_id: user.id,
      name: `Campaign - ${ideaName}`,
      objective: "OUTCOME_TRAFFIC",
      status: "BUILDING",
      budget_type: "DAILY",
      daily_budget: campaignSettings?.dailyBudget ?? null,
      spend_cap: null,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      campaign_id: null,
      adset_id: null,
      ad_id: null,
      creative_name: `Creative - ${ideaName}`,
      creative_message: adMessage ?? null,
      creative_link: null,
      creative_image_url: null,
      ad_creative: ideaRecord.ad_creative ?? null,
      created_at: now.toISOString(),
    });

    if (insertCampaignError) {
      return NextResponse.json({ success: false, error: insertCampaignError.message }, { status: 500 });
    }

    const { error: insertJobError } = await supabaseAdmin.from("experiment_jobs").insert({
      idea_id: ideaId,
      user_id: user.id,
      status: "queued",
      step: "queued",
      attempts: 0,
      next_run_at: now.toISOString(),
      locked_at: null,
      locked_by: null,
    });

    if (insertJobError) {
      return NextResponse.json({ success: false, error: insertJobError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ideaId,
      campaignRowId,
      slug: desiredSlug,
    });
  } catch (err: any) {
    console.error("Error in /api/createProject", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}

