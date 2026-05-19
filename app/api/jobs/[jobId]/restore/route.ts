import { NextResponse } from "next/server";
import { restorePhotoForJob } from "@/lib/openai-restoration";
import { getMockJob, updateMockJob } from "@/lib/mock-store";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getMockJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!job.sourceImagePath) {
    updateMockJob(jobId, {
      status: "manual_review",
      failureReason: "No source image path exists for this job."
    });
    return NextResponse.json({ error: "No source image is available for this job." }, { status: 409 });
  }

  updateMockJob(jobId, { status: "restoring", failureReason: undefined });

  try {
    const result = await restorePhotoForJob({
      jobId: job.id,
      sourceImagePath: job.sourceImagePath,
      mode: "preview"
    });

    const updated = updateMockJob(jobId, {
      status: "preview_ready",
      processingMode: result.mode,
      restoredPreviewPath: result.restoredPath,
      restoredPreviewUrl: result.restoredUrl,
      watermarkedPreviewPath: result.watermarkedPath,
      watermarkedPreviewUrl: result.watermarkedUrl
    });

    return NextResponse.json({
      job: updated,
      previewPage: `/preview/${job.sharePageSlug}`,
      mode: result.mode
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown restoration error";
    const updated = updateMockJob(jobId, {
      status: "failed",
      failureReason: message
    });

    return NextResponse.json({ error: message, job: updated }, { status: 500 });
  }
}
