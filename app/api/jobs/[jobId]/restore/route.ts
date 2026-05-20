import { NextResponse } from "next/server";
import { getCustomerByPhone, getJob, incrementFreePreviewCount, updateJob } from "@/lib/job-repository";
import { restorePhotoForJob } from "@/lib/openai-restoration";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!job.sourceImagePath) {
    await updateJob(jobId, {
      status: "manual_review",
      failureReason: "No source image path exists for this job."
    });
    return NextResponse.json({ error: "No source image is available for this job." }, { status: 409 });
  }

  const customer = await getCustomerByPhone(job.customerPhone);
  const freePreviewLimit = Number(process.env.FREE_PREVIEW_LIMIT_PER_PHONE ?? 1);
  if (customer && customer.freePreviewCount >= freePreviewLimit && job.status !== "preview_ready") {
    const updated = await updateJob(jobId, { status: "awaiting_payment" });
    return NextResponse.json(
      {
        error: "Free preview limit reached. Payment is required for another AI preview.",
        job: updated,
        paymentRequired: true
      },
      { status: 402 }
    );
  }

  await updateJob(jobId, { status: "restoring", failureReason: undefined });

  try {
    const result = await restorePhotoForJob({
      jobId: job.id,
      sourceImagePath: job.sourceImagePath,
      mode: "preview"
    });

    const updated = await updateJob(jobId, {
      status: "preview_ready",
      processingMode: result.provider,
      restoredPreviewPath: result.restoredPath,
      restoredPreviewUrl: result.restoredUrl,
      watermarkedPreviewPath: result.watermarkedPath,
      watermarkedPreviewUrl: result.watermarkedUrl,
      previewCostUsd: result.estimatedCostUsd
    });
    await incrementFreePreviewCount(job.customerPhone);

    return NextResponse.json({
      job: updated,
      previewPage: `/preview/${job.sharePageSlug}`,
      mode: result.provider
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown restoration error";
    const updated = await updateJob(jobId, {
      status: "failed",
      failureReason: message
    });

    return NextResponse.json({ error: message, job: updated }, { status: 500 });
  }
}
