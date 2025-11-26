import axios from "axios";

export async function POST(req) {
    try {
        const body = await req.json();

        const {
            // landing / destino
            url,
            projectName,
            // creative
            message,
            picture,
            callToActionType = "LEARN_MORE",
            // ad
            adName,
            // campaign settings
            campaignSettings = {
                durationDays: 7,
                dailyBudget: 5
            }
        } = body;

        const ACCESS_TOKEN = process.env.META_TOKEN;
        const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT;
        const PAGE_ID = process.env.META_PAGE_ID;

        if (!ACCESS_TOKEN || !AD_ACCOUNT_ID || !PAGE_ID) {
            return new Response(
                JSON.stringify({
                    error: "Faltan variables de entorno META_TOKEN, META_AD_ACCOUNT o META_PAGE_ID",
                }),
                { status: 500 }
            );
        }

        // 1️⃣ Create Campaign
        const campaign = await axios.post(
            `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/campaigns`,
            {
                name: `Campaign - ${projectName}`,
                objective: "LINK_CLICKS",
                status: "PAUSED",
                special_ad_categories: [],
            },
            { params: { access_token: ACCESS_TOKEN } }
        );

        const campaignId = campaign.data.id;

        // 2️⃣ Create AdSet with custom budget and duration
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + campaignSettings.durationDays);

        const adSet = await axios.post(
            `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/adsets`,
            {
                name: `AdSet - ${projectName}`,
                campaign_id: campaignId,
                daily_budget: campaignSettings.dailyBudget * 100, // Convert to cents
                bid_strategy: "LOWEST_COST_WITHOUT_CAP",
                billing_event: "IMPRESSIONS",
                optimization_goal: "REACH",
                targeting: {
                    geo_locations: { countries: ['ES'] },
                    age_min: 18,
                    age_max: 65
                },
                status: "PAUSED",
                end_time: endDate.toISOString()
            },
            { params: { access_token: ACCESS_TOKEN } }
        );

        const adSetId = adSet.data.id;

        // 3️⃣ Creative
        const creative = await axios.post(
            `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/adcreatives`,
            {
                name: `Creative - ${projectName}`,
                object_story_spec: {
                    page_id: PAGE_ID,
                    link_data: {
                        link: url,
                        message: message || `Descubre ${projectName}`,
                        picture,
                        call_to_action: { type: callToActionType },
                    },
                },
            },
            { params: { access_token: ACCESS_TOKEN } }
        );

        const creativeId = creative.data.id;

        // 4️⃣ Final Ad
        const ad = await axios.post(
            `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/ads`,
            {
                name: adName || `Ad - ${projectName}`,
                adset_id: adSetId,
                creative: { creative_id: creativeId },
                status: "PAUSED",
            },
            { params: { access_token: ACCESS_TOKEN } }
        );

        return new Response(
            JSON.stringify({
                success: true,
                campaignId,
                adSetId,
                creativeId,
                adId: ad.data.id,
                campaignSettings: {
                    durationDays: campaignSettings.durationDays,
                    dailyBudget: campaignSettings.dailyBudget,
                    totalBudget: campaignSettings.totalBudget
                }
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Error creating Meta Ad:", error.response?.data || error.message);
        return new Response(
            JSON.stringify({
                error: error.response?.data || error.message,
            }),
            { status: 500 }
        );
    }
}