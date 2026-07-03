import { NextResponse } from "next/server";
import { lookupAddressByZipcode } from "@/lib/utils";

export async function GET(req: Request) {
  const zip = new URL(req.url).searchParams.get("zip");
  if (!zip) {
    return NextResponse.json({ error: "zip parameter required" }, { status: 400 });
  }

  const address = await lookupAddressByZipcode(zip);
  if (!address) {
    return NextResponse.json({ error: "住所が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(address);
}

