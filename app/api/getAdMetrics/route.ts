import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const adId = searchParams.get("adId");

    if (!adId) {
        return NextResponse.json(
            { success: false, error: "Missing adId" },
            { status: 400 }
        );
    }

    const ACCESS_TOKEN = process.env.META_TOKEN;

    if (!ACCESS_TOKEN) {
        return NextResponse.json(
            { success: false, error: "Missing META_TOKEN env var" },
            { status: 500 }
        );
    }

    try {
        // https://developers.facebook.com/docs/marketing-api/insights
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${adId}/insights`,
            {
                params: {
                    access_token: ACCESS_TOKEN,
                    fields: "impressions,clicks,spend,cpc,ctr,actions,reach,frequency,cost_per_inline_link_click,inline_link_clicks",
                    date_preset: "maximum",
                },
            }
        );

        const data = response.data.data[0] || null;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Error fetching Meta Ads insights:", error.response?.data || error.message);
        return NextResponse.json(
            { success: false, error: error.response?.data?.error?.message || error.message },
            { status: 500 }
        );
    }
}
