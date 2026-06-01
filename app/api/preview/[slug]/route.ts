import { NextResponse } from "next/server";
import { getJobBySlug } from "@/lib/job-repository";
import { getPaymentForJob } from "@/lib/payment-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  const payment = await getPaymentForJob(job.id);
  const isPaid = payment?.status === "paid" || ["paid", "hd_ready", "delivered"].includes(job.status);

  return NextResponse.json({
    preview: {
      slug,
      jobId: job.id,
      status: job.status,
      restorationStyle: job.restorationStyle,
      priceInr: job.priceInr,
      sourceImageUrl: job.sourceImageUrl,
      restoredHdUrl: isPaid ? job.restoredHdUrl : undefined,
      beforeAfterShareUrl: isPaid ? job.beforeAfterShareUrl : undefined,
      watermarkedPreviewUrl: job.watermarkedPreviewUrl
    }
  }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
