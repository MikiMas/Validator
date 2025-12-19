import axios from "axios";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

const safeReadJsonBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

const extractCampaignId = (url: URL, body: any): string | null => {
  return (
    body?.campaignId ||
    body?.id ||
    url.searchParams.get("campaignId") ||
    url.searchParams.get("id")
  );
};

type DeleteMode = "delete" | "status";

const extractDeleteMode = (url: URL, body: any): DeleteMode => {
  const raw =
    body?.deleteMode ??
    body?.mode ??
    url.searchParams.get("deleteMode") ??
    url.searchParams.get("mode") ??
    "delete";

  const normalized = String(raw).toLowerCase().trim();
  if (normalized === "status" || normalized === "soft") return "status";
  return "delete";
};

const deleteCampaign = async ({
  campaignId,
  accessToken,
  mode,
}: {
  campaignId: string;
  accessToken: string;
  mode: DeleteMode;
}) => {
  if (mode === "status") {
    const res = await axios.post(
      `${GRAPH_API_BASE}/${campaignId}`,
      { status: "DELETED" },
      { params: { access_token: accessToken } }
    );
    return { deletedVia: "status" as const, meta: res.data };
  }

  try {
    const res = await axios.delete(`${GRAPH_API_BASE}/${campaignId}`, {
      params: { access_token: accessToken },
    });
    return { deletedVia: "delete" as const, meta: res.data };
  } catch (error: any) {
    const metaError = error?.response?.data?.error;
    const message = String(metaError?.message || error?.message || "");
    const shouldFallback =
      metaError?.code === 100 ||
      message.toLowerCase().includes("unsupported delete request");

    if (!shouldFallback) {
      throw error;
    }

    const res = await axios.post(
      `${GRAPH_API_BASE}/${campaignId}`,
      { status: "DELETED" },
      { params: { access_token: accessToken } }
    );
    return {
      deletedVia: "status" as const,
      meta: res.data,
      fallbackFrom: metaError || error?.message,
    };
  }
};

const handle = async (req: Request) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const accessToken = process.env.META_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Falta la variable de entorno META_TOKEN" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const body = await safeReadJsonBody(req);

    const campaignId = extractCampaignId(url, body);
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "Falta campaignId (o id) en body o query" },
        { status: 400 }
      );
    }

    const mode = extractDeleteMode(url, body);
    const result = await deleteCampaign({ campaignId, accessToken, mode });

    return NextResponse.json(
      {
        success: true,
        campaignId,
        deletedVia: result.deletedVia,
        meta: result.meta,
        ...(result.fallbackFrom ? { fallbackFrom: result.fallbackFrom } : {}),
      },
      { status: 200 }
    );
  } catch (error: any) {
    const metaError = error?.response?.data?.error;
    console.error("Error deleting Meta campaign:", metaError || error?.message);
    return NextResponse.json(
      { success: false, error: metaError || error?.message || "Error interno" },
      { status: 500 }
    );
  }
};

export async function POST(req: Request) {
  return handle(req);
}

export async function DELETE(req: Request) {
  return handle(req);
}

