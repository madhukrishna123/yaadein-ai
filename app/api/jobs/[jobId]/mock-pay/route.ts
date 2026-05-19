import { NextResponse } from "next/server";
import { restorePhotoForJob } from "@/lib/openai-restoration";
import { getMockJob, updateMockJob } from "@/lib/mock-store";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const existing = getMockJob(jobId);

  if (!existing) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!existing.sourceImagePath) {
    const job = updateMockJob(jobId, {
      status: "hd_ready",
      restoredHdUrl: "mock://restored-hd.jpg"
    });

    return NextResponse.json({
      job,
      messages: [
        "Payment received. Thank you.",
        "Your restored HD memory is ready."
      ],
      mode: "mock"
    });
  }

  const result = await restorePhotoForJob({
    jobId: existing.id,
    sourceImagePath: existing.sourceImagePath,
    mode: "hd"
  });

  const job = updateMockJob(jobId, {
    status: "hd_ready",
    processingMode: result.mode,
    restoredHdPath: result.restoredPath,
    restoredHdUrl: result.restoredUrl
  });

  return NextResponse.json({
    job,
    messages: [
      "Payment received. Thank you.",
      "Your restored HD memory is ready."
    ],
    mode: result.mode
  });
}
