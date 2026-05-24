import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/admin-auth";
import { getJob, updateJob } from "@/lib/job-repository";
import { getPaymentForJob, upsertPaymentLink } from "@/lib/payment-repository";
import { createRazorpayPaymentLink, hasRazorpayConfig } from "@/lib/razorpay";

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

  const existing = await getPaymentForJob(job.id);
  if (existing?.status === "paid") {
    await updateJob(job.id, { status: "paid" });
    return redirectOrJson(request, `/preview/${job.sharePageSlug}`, { payment: existing });
  }

  if (existing?.razorpayPaymentLinkUrl && existing.status === "created") {
    return redirectOrJson(request, existing.razorpayPaymentLinkUrl, { payment: existing });
  }

  const paymentLink = await createRazorpayPaymentLink({
    job,
    baseUrl: requestOrigin(request)
  });

  const payment = await upsertPaymentLink({
    jobId: job.id,
    amountInr: job.priceInr,
    status: paymentLink.status,
    razorpayPaymentLinkId: paymentLink.id,
    razorpayPaymentLinkUrl: paymentLink.url
  });

  if (job.status === "preview_ready") {
    await updateJob(job.id, { status: "awaiting_payment" });
  }

  return redirectOrJson(request, paymentLink.url, { payment });
}

function redirectOrJson(request: Request, url: string, body: unknown) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json(body);
  }

  return NextResponse.redirect(url);
}
