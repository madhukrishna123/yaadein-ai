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
      failureReason: "No source image path exists for HD export."
    });
    return NextResponse.json({ error: "No source image is available for this job." }, { status: 409 });
  }

  updateMockJob(jobId, { status: "paid", failureReason: undefined });

  try {
    const result = await restorePhotoForJob({
      jobId: job.id,
      sourceImagePath: job.sourceImagePath,
      mode: "hd"
    });

    const updated = updateMockJob(jobId, {
      status: "hd_ready",
      processingMode: result.mode,
      restoredHdPath: result.restoredPath,
      restoredHdUrl: result.restoredUrl
    });

    return NextResponse.json({
      job: updated,
      messages: [
        "Payment received. Thank you.",
        "Your restored HD memory is ready."
      ],
      mode: result.mode
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown HD export error";
    const updated = updateMockJob(jobId, {
      status: "failed",
      failureReason: message
    });

    return NextResponse.json({ error: message, job: updated }, { status: 500 });
  }
}
