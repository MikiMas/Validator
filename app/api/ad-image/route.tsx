import { ImageResponse } from "next/og";

export const runtime = "edge";

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function clampText(value: string, maxLen: number) {
  const normalized = (value || "").trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen - 1).trimEnd() + "…";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const headline = clampText(searchParams.get("headline") ?? "Tu titular aquí", 100);
  const message = clampText(
    searchParams.get("message") ??
      "Tu descripción aquí. Mantén el mensaje claro y con una llamada a la acción.",
    300
  );
  const brand = clampText(searchParams.get("brand") ?? "BuffLaunch", 40);

  const logoUrl = new URL("/images/logo_buff_redondo.png", request.url);
  const logoArrayBuffer = await fetch(logoUrl).then((r) => r.arrayBuffer());
  const logoBase64 = arrayBufferToBase64(logoArrayBuffer);
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0b1220",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 55%), radial-gradient(circle at 100% 20%, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0) 55%), linear-gradient(135deg, #0b1220 0%, #111827 45%, #0b1220 100%)",
          padding: 84,
          gap: 28,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: 800,
            letterSpacing: -1.2,
            lineHeight: 1.05,
            fontSize: 84,
            maxWidth: 820,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.88)",
            fontWeight: 500,
            lineHeight: 1.25,
            fontSize: 36,
            maxWidth: 900,
          }}
        >
          {message}
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logoDataUrl} width={56} height={56} style={{ borderRadius: 999 }} />
          <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 650, fontSize: 34 }}>
            {brand}
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Disposition": 'inline; filename="ad.png"',
      },
    }
  );
}
