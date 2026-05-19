import { NextResponse } from "next/server";
import { mockJobs } from "@/lib/mock-store";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = mockJobs.find((item) => item.sharePageSlug === slug);

  if (!job) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  return NextResponse.json({
    preview: {
      slug,
      jobId: job.id,
      status: job.status,
      priceInr: job.priceInr,
      watermarkedPreviewUrl: job.watermarkedPreviewUrl
    }
  });
}
