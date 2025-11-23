import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, email, name } = body ?? {};

    if (!slug || !email) {
      return NextResponse.json(
        { success: false, error: "Missing slug or email" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("waitlist_entries").insert({
      slug,
      email,
      name: name || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inserting waitlist entry", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in waitlist API", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
