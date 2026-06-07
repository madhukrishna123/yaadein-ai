import { NextRequest, NextResponse } from "next/server";
import { getJobsByStatuses } from "@/lib/job-repository";
import { deliverPaidWhatsAppJob, processWhatsAppPreviewJob } from "@/lib/whatsapp-workflow";
import { hasWhatsAppConfig } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return processQueuedJobs(request);
}

export async function POST(request: NextRequest) {
  return processQueuedJobs(request);
}

async function processQueuedJobs(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasWhatsAppConfig()) {
    return NextResponse.json({ received: true, configured: false });
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 2), 5);
  const errors: Array<{ jobId: string; stage: "preview" | "hd"; message: string }> = [];
  let previewProcessed = 0;
  let hdProcessed = 0;

  const previewJobs = await getJobsByStatuses(["photo_received"], limit);
  for (const job of previewJobs) {
    try {
      await processWhatsAppPreviewJob(job.id);
      previewProcessed += 1;
    } catch (error) {
      errors.push({
        jobId: job.id,
        stage: "preview",
        message: error instanceof Error ? error.message : "Preview processing failed."
      });
    }
  }

  const hdJobs = await getJobsByStatuses(["paid"], limit);
  for (const job of hdJobs) {
    try {
      await deliverPaidWhatsAppJob(job.id);
      hdProcessed += 1;
    } catch (error) {
      errors.push({
        jobId: job.id,
        stage: "hd",
        message: error instanceof Error ? error.message : "HD delivery failed."
      });
    }
  }

  return NextResponse.json({
    received: true,
    previewProcessed,
    hdProcessed,
    errors
  });
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.INTERNAL_JOB_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
  const querySecret = request.nextUrl.searchParams.get("secret") ?? undefined;

  return bearer === secret || querySecret === secret;
}
