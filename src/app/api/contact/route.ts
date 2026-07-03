import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryStatusEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const user = await getUser();

    const inquiry = await prisma.contactInquiry.create({
      data: {
        ...data,
        userId: user?.id ?? null,
      },
    });

    await sendInquiryStatusEmail({
      to: data.email,
      name: data.name,
      subject: data.subject,
      status: "OPEN",
    }).catch(() => null);

    return NextResponse.json({ id: inquiry.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "送信に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
