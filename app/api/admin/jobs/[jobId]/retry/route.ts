import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { updateJob } from "@/lib/job-repository";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorizedAdminResponse();
  }

  const { jobId } = await params;
  const job = await updateJob(jobId, { status: "restoring" });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    job,
    message: "Retry queued in mock mode."
  });
}
