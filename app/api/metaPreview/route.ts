import { NextResponse } from "next/server";

const META_TOKEN = process.env.META_TOKEN;

export async function GET(req: Request) {
  if (!META_TOKEN) {
    return NextResponse.json(
      { success: false, error: "META_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const adId = searchParams.get("adId");

  if (!adId) {
    return NextResponse.json(
      { success: false, error: "Missing adId" },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${adId}/previews`);
    url.searchParams.set("access_token", META_TOKEN as string);
    url.searchParams.set("ad_format", "DESKTOP_FEED_STANDARD");

    const res = await fetch(url.toString());
    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: json.error || "Meta API error" },
        { status: res.status }
      );
    }

    const html = Array.isArray(json.data) && json.data.length > 0 ? json.data[0].body : null;

    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error("Error fetching Meta preview", error);
    return NextResponse.json(
      { success: false, error: "Unexpected error fetching Meta preview" },
      { status: 500 }
    );
  }
}
