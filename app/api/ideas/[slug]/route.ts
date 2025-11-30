import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/authServer";
import { revalidatePath } from "next/cache";

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const authUser = await getUserFromRequest(_req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug requerido" }, { status: 400 });
    }

    // Primero elimina la waitlist asociada
    const { error: waitlistError } = await supabase
      .from("waitlist_entries")
      .delete()
      .eq("slug", slug);

    if (waitlistError) {
      console.error("Error al borrar waitlist:", waitlistError);
      return NextResponse.json({ success: false, error: waitlistError.message }, { status: 500 });
    }

    // Luego elimina la idea (solo si pertenece al usuario)
    const { error: ideaError } = await supabase
      .from("ideas")
      .delete()
      .eq("slug", slug)
      .eq("user_id", authUser.id);

    if (ideaError) {
      console.error("Error al borrar idea:", ideaError);
      return NextResponse.json({ success: false, error: ideaError.message }, { status: 500 });
    }

    // Invalidar rutas relacionadas (dashboard y la landing eliminada)
    try {
      revalidatePath("/");
      revalidatePath(`/${slug}`);
    } catch (revalidateError) {
      console.warn("No se pudo revalidar caché:", revalidateError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error en DELETE /api/ideas/[slug]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}
