import { NextResponse } from "next/server";
import { mockJobs } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json({
    jobs: mockJobs,
    summary: {
      totalJobs: mockJobs.length,
      previewReady: mockJobs.filter((job) => job.status === "preview_ready").length,
      paid: mockJobs.filter((job) => job.status === "paid" || job.status === "hd_ready").length
    }
  });
}
