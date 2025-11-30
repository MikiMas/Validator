import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";

const MIN_DAILY_BUDGET = 1; // €
const MAX_CAMPAIGN_DAYS = 90;
const DEFAULT_CPM = 5; // € per 1000 impressions
const ESTIMATED_CTR = 0.02; // 2%

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { dailyBudget } = await req.json();

    if (!dailyBudget || isNaN(dailyBudget) || dailyBudget < MIN_DAILY_BUDGET) {
      return NextResponse.json(
        { 
          error: `El presupuesto diario mínimo es de ${MIN_DAILY_BUDGET}€`,
          success: false
        },
        { status: 400 }
      );
    }

    const estimatedImpressions = Math.round((dailyBudget / DEFAULT_CPM) * 1000);
    const estimatedClicks = Math.round(estimatedImpressions * ESTIMATED_CTR);
    const estimatedCPC = dailyBudget / (estimatedClicks || 1);

    return NextResponse.json({
      success: true,
      estimatedImpressions,
      estimatedClicks,
      estimatedCPC: estimatedCPC.toFixed(2),
      cpm: DEFAULT_CPM,
      minDailyBudget: MIN_DAILY_BUDGET,
      maxCampaignDays: MAX_CAMPAIGN_DAYS
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al calcular la estimación",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
