import { NextRequest, NextResponse } from "next/server";
import { isSupportedImage, saveUploadedImage } from "@/lib/local-storage";
import { createJobId, createRestorationJob } from "@/lib/mock-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const phone = String(formData?.get("phone") ?? "+919999999999");
  const file = formData?.get("photo");

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
  const job = createRestorationJob({
    id: jobId,
    customerPhone: phone,
    sourceImageUrl: stored.publicUrl,
    sourceImagePath: stored.absolutePath
  });

  return NextResponse.json({
    job,
    messages: [
      "Got it. This looks like a precious memory.",
      "We are starting the restoration now."
    ]
  });
}
