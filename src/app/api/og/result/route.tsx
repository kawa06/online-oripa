import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "ORIPA VAULT";
  const prize = searchParams.get("prize") ?? "当選おめでとう！";
  const rank = searchParams.get("rank") ?? "S";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0b 0%, #1c1c1f 100%)",
          color: "#f5f5f5",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 28, color: "#d4af37", marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#f0d875" }}>{rank}</div>
        <div style={{ fontSize: 36, marginTop: 24, textAlign: "center" }}>{prize}</div>
        <div style={{ fontSize: 20, marginTop: 32, color: "#a1a1aa" }}>ORIPA VAULT</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
