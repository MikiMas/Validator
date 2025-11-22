import axios from "axios";

export async function POST(req) {
    try {
        const body = await req.json();

        const {
            // landing / destino
            url,
            projectName,
            // ad set existente
            adsetId,
            // creative
            message,
            picture,
            callToActionType = "LEARN_MORE",
            // ad
            adName
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

        // 1️⃣ Creative
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

        // 2️⃣ Final Ad
        const ad = await axios.post(
            `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/ads`,
            {
                name: adName || `Ad - ${projectName}`,
                adset_id: adsetId,
                creative: { creative_id: creativeId },
                status: "ACTIVE",
            },
            { params: { access_token: ACCESS_TOKEN } }
        );

        return new Response(
            JSON.stringify({
                success: true,
                creativeId,
                adId: ad.data.id,
            }),
            { status: 200 }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                error: error.response?.data || error.message,
            }),
            { status: 500 }
        );
    }
}