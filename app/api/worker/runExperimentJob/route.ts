import axios from "axios";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getRequestOrigin(req: Request) {
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) return `${proto}://${host}`;
  try {
    return new URL(req.url).origin;
  } catch {
    return "";
  }
}

async function uploadPngToSupabase({
  bucket,
  path,
  arrayBuffer,
}: {
  bucket: string;
  path: string;
  arrayBuffer: ArrayBuffer;
}) {
  const supabaseAdmin = getSupabaseAdminClient();
  const uploadRes = await supabaseAdmin.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (uploadRes.error) throw uploadRes.error;

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not get public URL for uploaded image");
  return data.publicUrl;
}

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

function computeNextRunAt(attempts: number) {
  const now = Date.now();
  const delays = [30_000, 120_000, 600_000]; // 30s, 2m, 10m
  const delay = delays[Math.min(attempts, delays.length - 1)];
  return new Date(now + delay).toISOString();
}

export async function POST(req: Request) {
  const workerSecret = process.env.WORKER_SECRET;
  const providedSecret = req.headers.get("x-worker-secret") || "";
  if (workerSecret && providedSecret !== workerSecret) {
    return json(401, { success: false, error: "Unauthorized worker" });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const origin = getRequestOrigin(req);

  // 1) Find one runnable job
  const { data: job } = await supabaseAdmin
    .from("experiment_jobs")
    .select("id, idea_id, user_id, attempts")
    .eq("status", "queued")
    .lte("next_run_at", new Date().toISOString())
    .is("locked_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!job) return json(200, { success: true, processed: false });

  // 2) Lock job
  const lockId = `${process.env.VERCEL_REGION || "local"}:${process.pid}:${Date.now()}`;
  const { data: locked, error: lockError } = await supabaseAdmin
    .from("experiment_jobs")
    .update({
      status: "running",
      step: "running",
      locked_at: new Date().toISOString(),
      locked_by: lockId,
    })
    .eq("id", job.id)
    .eq("status", "queued")
    .select("id, idea_id, user_id, attempts")
    .maybeSingle();

  if (lockError || !locked) return json(200, { success: true, processed: false, raced: true });

  // 3) Load idea + campaign row
  const { data: idea, error: ideaError } = await supabaseAdmin
    .from("ideas")
    .select("id, slug, idea_name, ad_creative, campaign_settings")
    .eq("id", locked.idea_id)
    .maybeSingle();

  if (ideaError || !idea) {
    await supabaseAdmin
      .from("experiment_jobs")
      .update({ status: "error", last_error: ideaError?.message || "Idea not found" })
      .eq("id", locked.id);
    return json(500, { success: false, error: "Idea not found" });
  }

  const { data: campaignRow } = await supabaseAdmin
    .from("campaigns")
    .select("id, status, creative_image_url")
    .eq("idea_id", idea.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const metaToken = process.env.META_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT;
  const pageId = process.env.META_PAGE_ID;
  const brand = process.env.META_CREATIVE_BRAND || "BuffLaunch";
  const fallbackPictureUrl =
    process.env.META_CREATIVE_PICTURE_URL || "https://www.bufflaunch.com/images/logoBuff.png";

  if (!metaToken || !adAccountId || !pageId) {
    await supabaseAdmin
      .from("experiment_jobs")
      .update({ status: "error", last_error: "Missing META_TOKEN/META_AD_ACCOUNT/META_PAGE_ID" })
      .eq("id", locked.id);
    return json(500, { success: false, error: "Missing Meta env vars" });
  }

  const creativeHeadline = idea.ad_creative?.headline || idea.idea_name;
  const creativeMessage = idea.ad_creative?.message || `Descubre ${idea.idea_name}`;
  const durationDays = idea.campaign_settings?.durationDays || 7;
  const dailyBudget = idea.campaign_settings?.dailyBudget || 5;

  const landingUrl = origin ? `${origin}/${idea.slug}` : `https://www.bufflaunch.com/${idea.slug}`;

  try {
    // Step: generate + upload image to Supabase (stable URL)
    const bucket = process.env.SUPABASE_AD_IMAGE_BUCKET || "files";
    const campaignRowId = campaignRow?.id || "unknown";
    const storagePath = `adImages/${campaignRowId}.png`;

    let storedCreativeImageUrl = campaignRow?.creative_image_url || null;
    if (!storedCreativeImageUrl && origin) {
      const imgUrl = `${origin}/api/ad-image?headline=${encodeURIComponent(creativeHeadline)}&message=${encodeURIComponent(
        creativeMessage
      )}&brand=${encodeURIComponent(brand)}`;
      const imgRes = await fetch(imgUrl, { cache: "no-store" });
      if (!imgRes.ok) throw new Error(`Image generation failed (${imgRes.status})`);
      const pngArrayBuffer = await imgRes.arrayBuffer();
      storedCreativeImageUrl = await uploadPngToSupabase({ bucket, path: storagePath, arrayBuffer: pngArrayBuffer });
    }

    // Step: create campaign
    const campaignRes = await axios.post(
      `${GRAPH_API_BASE}/act_${adAccountId}/campaigns`,
      {
        name: `Campaign - ${idea.idea_name}`,
        objective: "OUTCOME_TRAFFIC",
        status: "ACTIVE",
        special_ad_categories: [],
      },
      { params: { access_token: metaToken } }
    );

    const campaignId = campaignRes.data.id;

    // Step: create adset
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);
    const adSetRes = await axios.post(
      `${GRAPH_API_BASE}/act_${adAccountId}/adsets`,
      {
        name: `AdSet - ${idea.idea_name}`,
        campaign_id: campaignId,
        daily_budget: Math.round(dailyBudget * 100),
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        billing_event: "IMPRESSIONS",
        optimization_goal: "LINK_CLICKS",
        targeting: {
          geo_locations: { countries: ["ES"], location_types: ["home", "recent"] },
          age_min: 18,
          age_max: 50,
          locales: [4],
          publisher_platforms: ["facebook", "instagram"],
          device_platforms: ["mobile"],
          facebook_positions: ["feed"],
          instagram_positions: ["stream", "story"],
        },
        status: "ACTIVE",
        end_time: endDate.toISOString(),
      },
      { params: { access_token: metaToken } }
    );
    const adSetId = adSetRes.data.id;

    // Step: creative
    const creativeRes = await axios.post(
      `${GRAPH_API_BASE}/act_${adAccountId}/adcreatives`,
      {
        name: `Creative - ${idea.idea_name}`,
        object_story_spec: {
          page_id: pageId,
          link_data: {
            link: landingUrl,
            message: creativeMessage,
            picture: storedCreativeImageUrl || fallbackPictureUrl,
            call_to_action: { type: "SIGN_UP" },
          },
        },
      },
      { params: { access_token: metaToken } }
    );
    const creativeId = creativeRes.data.id;

    // Step: final ad
    const adRes = await axios.post(
      `${GRAPH_API_BASE}/act_${adAccountId}/ads`,
      { name: `Ad - ${idea.idea_name}`, adset_id: adSetId, creative: { creative_id: creativeId }, status: "ACTIVE" },
      { params: { access_token: metaToken } }
    );
    const adId = adRes.data.id;

    // Persist
    await supabaseAdmin.from("ideas").update({ ad_id: adId }).eq("id", idea.id);
    if (campaignRow?.id) {
      await supabaseAdmin
        .from("campaigns")
        .update({
          status: "ACTIVE",
          campaign_id: campaignId,
          adset_id: adSetId,
          ad_id: adId,
          creative_image_url: storedCreativeImageUrl,
          creative_link: landingUrl,
        })
        .eq("id", campaignRow.id);
    }

    await supabaseAdmin.from("experiment_jobs").update({ status: "done", step: "done" }).eq("id", locked.id);
    return json(200, { success: true, processed: true, ideaId: idea.id, adId });
  } catch (error: any) {
    const meta = error?.response?.data || null;
    const message = meta ? JSON.stringify(meta) : error?.message || "Unknown error";
    const attempts = Number(locked.attempts || 0) + 1;

    const nextStatus = attempts >= 3 ? "error" : "queued";
    const nextRunAt = attempts >= 3 ? null : computeNextRunAt(attempts - 1);

    await supabaseAdmin
      .from("experiment_jobs")
      .update({
        status: nextStatus,
        step: "error",
        attempts,
        last_error: message,
        next_run_at: nextRunAt || new Date().toISOString(),
        locked_at: null,
        locked_by: null,
      })
      .eq("id", locked.id);

    if (campaignRow?.id) {
      await supabaseAdmin.from("campaigns").update({ status: "ERROR" }).eq("id", campaignRow.id);
    }

    return json(500, { success: false, processed: true, error: message, attempts });
  }
}

