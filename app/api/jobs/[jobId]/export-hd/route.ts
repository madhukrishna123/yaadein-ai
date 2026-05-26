import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/job-repository";
import { restorePhotoForJob } from "@/lib/openai-restoration";
import { getPaymentForJob } from "@/lib/payment-repository";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!job.sourceImagePath) {
    await updateJob(jobId, {
      status: "manual_review",
      failureReason: "No source image path exists for HD export."
    });
    return NextResponse.json({ error: "No source image is available for this job." }, { status: 409 });
  }

  const payment = await getPaymentForJob(job.id);
  const isPaid = payment?.status === "paid" || ["paid", "hd_ready", "delivered"].includes(job.status);
  if (!isPaid) {
    await updateJob(jobId, { status: "awaiting_payment" });
    return NextResponse.json({ error: "Payment is required before HD export." }, { status: 402 });
  }

  await updateJob(jobId, { status: "paid", failureReason: undefined });

  try {
    const result = await restorePhotoForJob({
      jobId: job.id,
      sourceImagePath: job.sourceImagePath,
      mode: "hd",
      style: job.restorationStyle
    });

    const updated = await updateJob(jobId, {
      status: "hd_ready",
      processingMode: result.provider,
      restoredHdPath: result.restoredPath,
      restoredHdUrl: result.restoredUrl,
      beforeAfterSharePath: result.beforeAfterSharePath,
      beforeAfterShareUrl: result.beforeAfterShareUrl,
      hdCostUsd: result.estimatedCostUsd
    });

    return redirectOrJson(request, `/preview/${job.sharePageSlug}`, {
      job: updated,
      messages: [
        "Payment received. Thank you.",
        "Your restored HD memory is ready."
      ],
      mode: result.provider
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown HD export error";
    const updated = await updateJob(jobId, {
      status: "failed",
      failureReason: message
    });

    return NextResponse.json({ error: message, job: updated }, { status: 500 });
  }
}

function redirectOrJson(request: Request, url: string, body: unknown) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json(body);
  }

  return NextResponse.redirect(new URL(url, request.url));
}
