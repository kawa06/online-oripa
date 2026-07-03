import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { requireProfile } from "@/lib/auth";
import { POINT_PACKAGES } from "@/lib/constants";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const schema = z.object({ points: z.number().int().positive() });

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe が未設定です" }, { status: 503 });
    }

    const profile = await requireProfile();
    const { points } = schema.parse(await req.json());
    const pkg = POINT_PACKAGES.find((p) => p.points === points);
    if (!pkg) {
      return NextResponse.json({ error: "パッケージが見つかりません" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: { name: `ORIPA VAULT ${pkg.name}` },
            unit_amount: pkg.priceYen,
          },
          quantity: 1,
        },
      ],
      metadata: { userId: profile.id, points: String(pkg.points), packageId: pkg.id },
      success_url: `${appUrl}/points?success=1`,
      cancel_url: `${appUrl}/points?cancel=1`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout作成に失敗しました";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
