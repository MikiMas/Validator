import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/authServer";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const ideaId = typeof body?.ideaId === "string" && body.ideaId.trim() ? body.ideaId.trim() : null;

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ success: false, error: "Message is too long" }, { status: 400 });
    }

    const insertPayload: Record<string, any> = {
      user_id: authUser.id,
      user_email: authUser.email ?? null,
      message,
      idea_id: ideaId,
      user_agent: req.headers.get("user-agent"),
      origin: new URL(req.url).origin,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("feedback").insert(insertPayload).select().single();
    if (error) {
      console.error("Error inserting feedback:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const subject = `[Buff Launch] New feedback${ideaId ? ` (idea ${ideaId})` : ""}`;
    const text =
      `New feedback received.\n\n` +
      `From: ${authUser.email || authUser.id}\n` +
      `Idea ID: ${ideaId || "n/a"}\n` +
      `Created at: ${insertPayload.created_at}\n\n` +
      `Message:\n${message}\n\n` +
      `Row id: ${data?.id || "n/a"}\n`;

    try {
      await sendEmail({ subject, text, to: undefined });
    } catch (mailError: any) {
      console.error("Feedback email failed:", mailError?.message || mailError);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error in /api/feedback", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
