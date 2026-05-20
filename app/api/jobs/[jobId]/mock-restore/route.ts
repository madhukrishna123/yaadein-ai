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
      status: "preview_ready",
      watermarkedPreviewUrl: "mock://watermarked-preview.jpg"
    });

    return NextResponse.json({
      job,
      previewPage: `/preview/${existing.sharePageSlug}`,
      mode: "mock"
    });
  }

  const result = await restorePhotoForJob({
    jobId: existing.id,
    sourceImagePath: existing.sourceImagePath,
    mode: "preview"
  });

  const job = updateMockJob(jobId, {
    status: "preview_ready",
    processingMode: result.provider,
    restoredPreviewPath: result.restoredPath,
    restoredPreviewUrl: result.restoredUrl,
    watermarkedPreviewPath: result.watermarkedPath,
    watermarkedPreviewUrl: result.watermarkedUrl
  });

  return NextResponse.json({
    job,
    previewPage: `/preview/${existing.sharePageSlug}`,
    mode: result.provider
  });
}
