import axios from "axios";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getUserFromRequest } from "@/lib/authServer";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

const deleteMetaNode = async (nodeId: string, accessToken: string) => {
  try {
    await axios.delete(`${GRAPH_API_BASE}/${nodeId}`, {
      params: { access_token: accessToken }
    });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting Meta entity ${nodeId}:`, (error as any).response?.data || (error as any).message);
    return { success: false, error: (error as any).response?.data || (error as any).message };
  }
};

export async function POST(req: Request) {
  console.log('Delete experiment API called');
  try {
    console.log('Getting supabase admin client...');
    const supabaseAdmin = getSupabaseAdminClient();

    const body = await req.json();
    console.log('Request body:', body);
    const experimentId = body?.id;

    if (!experimentId) {
      console.error('No experiment ID provided');
      return NextResponse.json(
        { success: false, error: "Falta el ID del experimento que deseas eliminar." },
        { status: 400 }
      );
    }

    console.log('Getting user from request...');
    const user = await getUserFromRequest(req);
    console.log('User:', user?.id || 'No user found');
    if (!user) {
      console.error('User not authorized');
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    // First, get experiment details
    const { data: idea, error: fetchError } = await supabaseAdmin
      .from("ideas")
      .select("id, slug, user_id, ad_id, idea_name")
      .eq("id", experimentId)
      .single();

    if (fetchError) {
      console.error('Error fetching experiment:', fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message || "No se encontró el experimento" },
        { status: 404 }
      );
    }

    if (!idea || idea.user_id !== user.id) {
      console.error('Permission denied');
      return NextResponse.json({ success: false, error: "No tienes permiso para eliminar este experimento" }, { status: 403 });
    }

    // STEP 1: Delete from Supabase first (this is the most important)
    console.log('Deleting experiment from Supabase...');
    const { error: deleteError } = await supabaseAdmin
      .from("ideas")
      .delete()
      .eq("id", experimentId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error('Error deleting from Supabase:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message || "No se pudo borrar el experimento" },
        { status: 500 }
      );
    }

    console.log('Successfully deleted from Supabase');

    // STEP 2: Delete waitlist entries if slug exists
    if (idea.slug) {
      console.log('Deleting waitlist entries...');
      await supabaseAdmin.from("waitlist_entries").delete().eq("slug", idea.slug);
    }

    // STEP 3: Try to delete Facebook ad (non-blocking)
    if (idea.ad_id) {
      console.log('Attempting to delete Facebook ad...');
      const accessToken = process.env.META_TOKEN;
      
      if (accessToken) {
        try {
          // Get ad info to find related entities
          const { data: adInfo } = await axios.get(`${GRAPH_API_BASE}/${idea.ad_id}`, {
            params: { access_token: accessToken, fields: "adset_id,campaign_id" }
          });

          // Delete the ad
          const adResult = await deleteMetaNode(idea.ad_id, accessToken);

          // Delete adset if exists
          if (adInfo?.adset_id) {
            const adsetResult = await deleteMetaNode(adInfo.adset_id, accessToken);

          }

          // Delete campaign if exists
          if (adInfo?.campaign_id) {
            const campaignResult = await deleteMetaNode(adInfo.campaign_id, accessToken);

          }

          console.log('Facebook ad deletion process completed');
        } catch (metaError) {
          console.error("Error during Facebook ad cleanup:", (metaError as any).response?.data || (metaError as any).message);
        }
      } else {
        console.warn('META_TOKEN not found, skipping Facebook ad deletion');
      }
    }

    return NextResponse.json({ 
      success: true, 
    });
  } catch (err: any) {
    console.error("Error en /api/deleteExperiment", err);
    return NextResponse.json({ success: false, error: err?.message || "Error interno" }, { status: 500 });
  }
}
