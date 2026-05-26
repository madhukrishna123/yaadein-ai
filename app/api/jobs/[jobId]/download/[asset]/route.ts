import { NextResponse } from "next/server";
import { getJob } from "@/lib/job-repository";
import { getPaymentForJob } from "@/lib/payment-repository";
import { readStoredImageBuffer } from "@/lib/storage-read";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string; asset: string }> }) {
  const { jobId, asset } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const payment = await getPaymentForJob(job.id);
  const isPaid = payment?.status === "paid" || ["paid", "hd_ready", "delivered"].includes(job.status);

  if (!isPaid) {
    return NextResponse.json({ error: "Payment is required before download." }, { status: 402 });
  }

  const file =
    asset === "hd"
      ? {
          path: job.restoredHdPath,
          filename: `${job.id}_restored-hd-export.jpg`
        }
      : asset === "share"
        ? {
            path: job.beforeAfterSharePath,
            filename: `${job.id}_before-after-share.jpg`
          }
        : undefined;

  if (!file) {
    return NextResponse.json({ error: "Download asset is not supported." }, { status: 404 });
  }

  if (!file.path) {
    return NextResponse.json({ error: "Download file is not ready." }, { status: 404 });
  }

  try {
    const buffer = await readStoredImageBuffer(file.path);
    return new Response(buffer, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": String(buffer.length),
        "Content-Type": "image/jpeg"
      }
    });
  } catch {
    return NextResponse.json({ error: "Download file could not be read." }, { status: 404 });
  }
}
