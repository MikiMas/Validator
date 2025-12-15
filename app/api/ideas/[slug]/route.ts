import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getUserFromRequest } from "@/lib/authServer";
import { revalidatePath } from "next/cache";

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const authUser = await getUserFromRequest(_req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // First delete the associated waitlist
    const { error: waitlistError } = await supabaseAdmin
      .from("waitlist_entries")
      .delete()
      .eq("slug", slug);

    if (waitlistError) {
      console.error("Error deleting waitlist:", waitlistError);
      return NextResponse.json({ success: false, error: waitlistError.message }, { status: 500 });
    }

    // Then delete the idea (only if it belongs to the user)
    const { error: ideaError } = await supabaseAdmin
      .from("ideas")
      .delete()
      .eq("slug", slug)
      .eq("user_id", authUser.id);

    if (ideaError) {
      console.error("Error deleting idea:", ideaError);
      return NextResponse.json({ success: false, error: ideaError.message }, { status: 500 });
    }

    // Invalidate related routes (dashboard and the deleted landing)
    try {
      revalidatePath("/");
      revalidatePath(`/${slug}`);
    } catch (revalidateError) {
      console.warn("Could not revalidate cache:", revalidateError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/ideas/[slug]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
