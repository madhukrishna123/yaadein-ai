import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/job-repository";
import { isSupportedImage, saveUploadedImage } from "@/lib/local-storage";
import { createJobId } from "@/lib/mock-store";
import { getPricingPlan, getRestorationStyle } from "@/lib/yaadein-data";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("photo");
  const phone = normalizePhone(String(formData?.get("phone") ?? ""));
  const plan = getPricingPlan(String(formData?.get("planId") ?? ""));
  const restorationStyle = getRestorationStyle(String(formData?.get("restorationStyle") ?? ""));

  if (!phone) {
    return NextResponse.json({ error: "WhatsApp phone number is required." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Photo file is required." }, { status: 400 });
  }

  if (!isSupportedImage(file)) {
    return NextResponse.json({ error: "Only JPG, PNG, and WEBP photos are supported." }, { status: 415 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo must be less than 50MB." }, { status: 413 });
  }

  const jobId = createJobId();
  const stored = await saveUploadedImage(file, jobId);
  const job = await createJob({
    id: jobId,
    customerPhone: phone,
    sourceImagePath: stored.absolutePath,
    sourceImageUrl: stored.publicUrl,
    priceInr: plan.priceInr,
    restorationStyle: restorationStyle.id
  });

  return NextResponse.json({
    job,
    next: {
      preview: `/api/jobs/${job.id}/restore`,
      status: `/api/jobs/${job.id}`
    }
  });
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return "";
}
