import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/admin-auth";
import { getJob, updateJob } from "@/lib/job-repository";
import { ensurePaymentLinkForJob } from "@/lib/payment-flow";
import { getPaymentForJob } from "@/lib/payment-repository";
import { hasRazorpayConfig } from "@/lib/razorpay";

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

  const payment = await ensurePaymentLinkForJob(job, requestOrigin(request));

  return redirectOrJson(request, payment.razorpayPaymentLinkUrl ?? `/preview/${job.sharePageSlug}`, { payment });
}

function redirectOrJson(request: Request, url: string, body: unknown) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json(body);
  }

  return NextResponse.redirect(url);
}
