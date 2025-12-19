import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from "@/lib/authServer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Verify user authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['slug', 'idea_name', 'idea_description', 'landing'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Faltan campos requeridos: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Prepare experiment data
    const experimentData = {
      id: uuidv4(),
      slug: body.slug,
      idea_name: body.idea_name,
      idea_description: body.idea_description,
      landing: body.landing,
      user_id: user.id,
      created_at: new Date().toISOString(),
      campaign_settings: body.campaign_settings || null,
      ad_creative: body.ad_creative || null,
      ad_id: body.ad_id || null,
      campaign_id: body.campaign_id || null,
      adset_id: body.adset_id || null,
      fotourl: body.fotourl || null
    };

    // Insert into database
    const { data, error } = await supabase
      .from('ideas')
      .insert(experimentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating experiment:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error: any) {
    console.error('Error in /api/experiments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
