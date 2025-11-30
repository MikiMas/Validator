import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/authServer";

export async function POST(req: Request) {
    try {
        const authUser = await getUserFromRequest(req);
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        const { slug, adId } = await req.json();

        if (!slug) {
            return NextResponse.json(
                { success: false, error: "Missing idea slug" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("ideas")
            .update({ ad_id: adId })
            .eq("slug", slug)
            .eq("user_id", authUser.id);

        if (error) {
            console.error("Error updating idea:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error in /api/updateIdea:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
