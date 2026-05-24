import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { updateJob } from "@/lib/job-repository";
import { markPaymentPaid, updatePaymentStatus } from "@/lib/payment-repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Razorpay webhook secret is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !isValidWebhookSignature(body, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Razorpay webhook signature." }, { status: 401 });
  }

  const payload = JSON.parse(body) as RazorpayWebhookPayload;
  const entity = payload.payload?.payment_link?.entity;

  if (!entity?.id) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (payload.event === "payment_link.paid" || entity.status === "paid") {
    const paymentId = payload.payload?.payment?.entity?.id;
    const payment = await markPaymentPaid({
      razorpayPaymentLinkId: entity.id,
      razorpayPaymentId: paymentId
    });

    if (payment) {
      await updateJob(payment.jobId, { status: "paid" });
    }

    return NextResponse.json({ received: true, paid: true });
  }

  if (["cancelled", "expired"].includes(entity.status)) {
    await updatePaymentStatus({
      razorpayPaymentLinkId: entity.id,
      status: entity.status
    });
  }

  return NextResponse.json({ received: true });
}

function isValidWebhookSignature(body: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment_link?: {
      entity?: {
        id?: string;
        status: "created" | "paid" | "cancelled" | "expired";
      };
    };
    payment?: {
      entity?: {
        id?: string;
      };
    };
  };
}
