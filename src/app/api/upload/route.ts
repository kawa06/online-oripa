import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadPublicFile } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "misc");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "画像ファイルのみアップロードできます" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "5MB以下のファイルにしてください" }, { status: 400 });
    }

    const url = await uploadPublicFile(file, folder);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "アップロードに失敗しました";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
