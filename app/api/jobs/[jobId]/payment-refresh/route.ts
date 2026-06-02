import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/job-repository";
import { getPaymentForJob, markPaymentPaid, updatePaymentStatus } from "@/lib/payment-repository";
import { getRazorpayPaymentLink, hasRazorpayConfig } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!hasRazorpayConfig()) {
    return NextResponse.json({ error: "Razorpay API keys are not configured." }, { status: 503 });
  }

  const payment = await getPaymentForJob(job.id);
  if (!payment?.razorpayPaymentLinkId) {
    return NextResponse.json({ error: "No Razorpay payment link exists for this job." }, { status: 404 });
  }

  const razorpayPayment = await getRazorpayPaymentLink(payment.razorpayPaymentLinkId);

  if (razorpayPayment.status === "paid") {
    const paidPayment = await markPaymentPaid({
      jobId: job.id,
      razorpayPaymentLinkId: payment.razorpayPaymentLinkId,
      razorpayPaymentId: razorpayPayment.paymentId
    });
    const updated = await updateJob(job.id, { status: "paid" });

    return redirectOrJson(request, `/preview/${job.sharePageSlug}`, {
      paid: true,
      payment: paidPayment,
      job: updated
    });
  }

  const updatedPayment = await updatePaymentStatus({
    razorpayPaymentLinkId: payment.razorpayPaymentLinkId,
    status: razorpayPayment.status
  });

  return redirectOrJson(request, `/preview/${job.sharePageSlug}`, {
    paid: false,
    payment: updatedPayment,
    status: razorpayPayment.status
  });
}

function redirectOrJson(request: Request, url: string, body: unknown) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json(body);
  }

  return NextResponse.redirect(new URL(url, request.url));
}
