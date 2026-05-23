import { NextResponse } from "next/server";
import { getJobBySlug } from "@/lib/job-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  return NextResponse.json({
    preview: {
      slug,
      jobId: job.id,
      status: job.status,
      priceInr: job.priceInr,
      sourceImageUrl: job.sourceImageUrl,
      restoredPreviewUrl: job.restoredPreviewUrl,
      restoredHdUrl: job.restoredHdUrl,
      watermarkedPreviewUrl: job.watermarkedPreviewUrl
    }
  });
}
