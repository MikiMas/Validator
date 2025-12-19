import axios from "axios";
import { getUserFromRequest } from "@/lib/authServer";
import { sendRollbackEmail } from "@/lib/mailer";

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

export async function POST(req) {
  let authUser;
  let campaignId;
  let adSetId;
  let creativeId;

  try {
    authUser = await getUserFromRequest(req);
    if (!authUser) return json(401, { error: "No autorizado" });

    const body = await req.json();

    // Mapeo de países a códigos de idioma (Meta locales)
    const countryToLanguage = {
      ES: 4, // Español
      US: 22, // Inglés
      FR: 16, // Francés
      DE: 7, // Alemán
      IT: 26, // Italiano
      PT: 36, // Portugués
      default: 4,
    };

    const {
      url,
      projectName,
      message,
      callToActionType = "LEARN_MORE",
      adName,
      country = "ES",
      campaignSettings = { durationDays: 7, dailyBudget: 5 },
    } = body ?? {};

    const validationErrors = {};
    if (!url || typeof url !== "string") validationErrors.url = "url es obligatorio";
    if (url && typeof url === "string") {
      try {
        // eslint-disable-next-line no-new
        new URL(url);
      } catch {
        validationErrors.url = "url no es válida";
      }
    }
    if (!projectName || typeof projectName !== "string") validationErrors.projectName = "projectName es obligatorio";

    const durationDays = parseNumber(campaignSettings?.durationDays);
    const dailyBudget = parseNumber(campaignSettings?.dailyBudget);
    if (!Number.isFinite(durationDays) || durationDays < 1) validationErrors.durationDays = "durationDays debe ser >= 1";
    if (!Number.isFinite(dailyBudget) || dailyBudget < 1) validationErrors.dailyBudget = "dailyBudget debe ser >= 1";

    if (Object.keys(validationErrors).length > 0) {
      return json(400, { error: "Bad Request", validationErrors });
    }

    const normalizedCountry = typeof country === "string" ? country.toUpperCase() : "ES";
    const totalBudget = Math.round(dailyBudget * durationDays * 100) / 100;

    const ACCESS_TOKEN = process.env.META_TOKEN;
    const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT;
    const PAGE_ID = process.env.META_PAGE_ID;
    const CREATIVE_PICTURE_URL =
      process.env.META_CREATIVE_PICTURE_URL || "https://www.bufflaunch.com/images/logoBuff.png";

    if (!ACCESS_TOKEN || !AD_ACCOUNT_ID || !PAGE_ID) {
      return json(500, {
        error: "Faltan variables de entorno META_TOKEN, META_AD_ACCOUNT o META_PAGE_ID",
      });
    }

    const rollbackCreated = async (reason) => {
      const idsToDelete = [creativeId, adSetId, campaignId].filter(Boolean);
      if (idsToDelete.length === 0) return { rolledBack: false, deleted: [] };

      const deleted = [];
      await Promise.all(
        idsToDelete.map(async (id) => {
          try {
            await axios.delete(`https://graph.facebook.com/v19.0/${id}`, {
              params: { access_token: ACCESS_TOKEN },
            });
            deleted.push(id);
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError.response?.data || rollbackError.message);
          }
        })
      );

      const metaUser = authUser?.email || authUser?.id || "unknown";
      const subject = `[BuffLaunch] Rollback createMetaAd (${projectName})`;
      const text =
        `Rollback ejecutado por error en createMetaAd.\n\n` +
        `Usuario: ${metaUser}\n` +
        `Proyecto: ${projectName}\n` +
        `URL: ${url}\n` +
        `País: ${normalizedCountry}\n` +
        `Motivo: ${reason}\n\n` +
        `IDs creados:\n` +
        `- campaignId: ${campaignId || "n/a"}\n` +
        `- adSetId: ${adSetId || "n/a"}\n` +
        `- creativeId: ${creativeId || "n/a"}\n\n` +
        `IDs borrados:\n` +
        deleted.map((x) => `- ${x}`).join("\n");

      try {
        await sendRollbackEmail({ subject, text });
      } catch (mailError) {
        console.error("Rollback email failed:", mailError.message);
      }

      return { rolledBack: deleted.length > 0, deleted };
    };

    // 1) Create Campaign
    const campaign = await axios.post(
      `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/campaigns`,
      {
        name: `Campaign - ${projectName}`,
        objective: "OUTCOME_TRAFFIC",
        status: "ACTIVE",
        special_ad_categories: [],
      },
      { params: { access_token: ACCESS_TOKEN } }
    );
    campaignId = campaign.data.id;

    // 2) Create AdSet with custom budget and duration
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    try {
      const adSet = await axios.post(
        `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/adsets`,
        {
          name: `AdSet - ${projectName}`,
          campaign_id: campaignId,
          daily_budget: Math.round(dailyBudget * 100), // minor units
          bid_strategy: "LOWEST_COST_WITHOUT_CAP",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: {
            geo_locations: {
              countries: [normalizedCountry],
              location_types: ["home", "recent"],
            },
            age_min: 18,
            age_max: 50,
            locales: [countryToLanguage[normalizedCountry] || countryToLanguage.default],
            publisher_platforms: ["facebook", "instagram"],
            device_platforms: ["mobile"],
            facebook_positions: ["feed"],
            instagram_positions: ["feed", "story"],
          },
          status: "ACTIVE",
          end_time: endDate.toISOString(),
        },
        { params: { access_token: ACCESS_TOKEN } }
      );
      adSetId = adSet.data.id;
    } catch (adSetError) {
      const rollbackInfo = await rollbackCreated("Fallo creando AdSet");
      throw Object.assign(adSetError, { rollbackInfo });
    }

    // 3) Creative
    try {
      const creative = await axios.post(
        `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/adcreatives`,
        {
          name: `Creative - ${projectName}`,
          object_story_spec: {
            page_id: PAGE_ID,
            link_data: {
              link: url,
              message: message || `Descubre ${projectName}`,
              picture: CREATIVE_PICTURE_URL,
              call_to_action: { type: callToActionType },
            },
          },
        },
        { params: { access_token: ACCESS_TOKEN } }
      );
      creativeId = creative.data.id;
    } catch (creativeError) {
      const rollbackInfo = await rollbackCreated("Fallo creando Creative");
      throw Object.assign(creativeError, { rollbackInfo });
    }

    // 4) Final Ad
    let ad;
    try {
      ad = await axios.post(
        `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/ads`,
        {
          name: adName || `Ad - ${projectName}`,
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: "ACTIVE",
        },
        { params: { access_token: ACCESS_TOKEN } }
      );
    } catch (adError) {
      const rollbackInfo = await rollbackCreated("Fallo creando Ad");
      throw Object.assign(adError, { rollbackInfo });
    }

    return json(200, {
      success: true,
      campaignId,
      adSetId,
      creativeId,
      adId: ad.data.id,
      status: "ACTIVE",
      message: "El anuncio está activo y en proceso de revisión por Meta.",
      campaignSettings: { durationDays, dailyBudget, totalBudget },
    });
  } catch (error) {
    const metaError = error.response?.data?.error;
    const metaUserTitle = error.response?.data?.error?.error_user_title;
    const metaUserMsg = error.response?.data?.error?.error_user_msg;

    console.error("Error creating Meta Ad:", error.response?.data || metaError || error.message);

    return json(500, {
      error: metaError || error.message,
      metaUserTitle,
      metaUserMsg,
      rollbackInfo: error.rollbackInfo,
    });
  }
}

