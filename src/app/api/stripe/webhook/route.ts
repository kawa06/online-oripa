import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const points = Number(session.metadata?.points ?? 0);

    if (userId && points > 0 && session.id) {
      const existing = await prisma.pointTransaction.findFirst({
        where: { stripeSessionId: session.id },
      });
      if (!existing) {
        await prisma.$transaction(async (tx) => {
          const profile = await tx.profile.update({
            where: { id: userId },
            data: { points: { increment: points } },
          });
          await tx.pointTransaction.create({
            data: {
              userId,
              type: "PURCHASE",
              amount: points,
              balanceAfter: profile.points,
              description: `ポイント購入 ${points.toLocaleString()}pt`,
              stripeSessionId: session.id,
            },
          });
        });
      }
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const sessionId = charge.metadata?.checkout_session_id;
    if (sessionId) {
      const purchase = await prisma.pointTransaction.findFirst({
        where: { stripeSessionId: sessionId, type: "PURCHASE" },
      });
      if (purchase) {
        const refundExists = await prisma.pointTransaction.findFirst({
          where: { description: `返金: ${sessionId}` },
        });
        if (!refundExists) {
          await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.update({
              where: { id: purchase.userId },
              data: { points: { decrement: purchase.amount } },
            });
            await tx.pointTransaction.create({
              data: {
                userId: purchase.userId,
                type: "REFUND",
                amount: -purchase.amount,
                balanceAfter: profile.points,
                description: `返金: ${sessionId}`,
                stripeSessionId: sessionId,
              },
            });
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
