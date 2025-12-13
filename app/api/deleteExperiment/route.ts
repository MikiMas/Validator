import axios from "axios";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/authServer";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

const deleteMetaNode = async (nodeId: string, accessToken: string) => {
  try {
    await axios.delete(`${GRAPH_API_BASE}/${nodeId}`, {
      params: { access_token: accessToken }
    });
  } catch (error) {
    console.error(`Error deleting Meta entity ${nodeId}:`, (error as any).response?.data || (error as any).message);
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const experimentId = body?.id;

    if (!experimentId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del experimento que deseas eliminar." },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { data: idea, error: fetchError } = await supabase
      .from("ideas")
      .select("id, slug, user_id, ad_id")
      .eq("id", experimentId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message || "No se encontró el experimento" },
        { status: 404 }
      );
    }

    if (!idea || idea.user_id !== user.id) {
      return NextResponse.json({ success: false, error: "No tienes permiso para eliminar este experimento" }, { status: 403 });
    }

    const accessToken = process.env.META_TOKEN;
    if (idea.ad_id && accessToken) {
      try {
        const { data: adInfo } = await axios.get(`${GRAPH_API_BASE}/${idea.ad_id}`, {
          params: { access_token: accessToken, fields: "adset_id,campaign_id" }
        });

        await deleteMetaNode(idea.ad_id, accessToken);

        if (adInfo?.adset_id) {
          await deleteMetaNode(adInfo.adset_id, accessToken);
        }

        if (adInfo?.campaign_id) {
          await deleteMetaNode(adInfo.campaign_id, accessToken);
        }
      } catch (metaError) {
        console.error("Error realizando limpieza de META:", (metaError as any).response?.data || (metaError as any).message);
      }
    }

    const { error: deleteError } = await supabase
      .from("ideas")
      .delete()
      .eq("id", experimentId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message || "No se pudo borrar el experimento" },
        { status: 500 }
      );
    }

    if (idea.slug) {
      await supabase.from("waitlist_entries").delete().eq("slug", idea.slug);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error en /api/deleteExperiment", err);
    return NextResponse.json({ success: false, error: err?.message || "Error interno" }, { status: 500 });
  }
}
