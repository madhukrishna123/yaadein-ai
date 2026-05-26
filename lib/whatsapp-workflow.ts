import { createJob, getCustomerByPhone, getJob, incrementFreePreviewCount, updateJob } from "@/lib/job-repository";
import { saveImageBuffer } from "@/lib/local-storage";
import { createJobId } from "@/lib/mock-store";
import { restorePhotoForJob } from "@/lib/openai-restoration";
import { ensurePaymentLinkForJob } from "@/lib/payment-flow";
import { absoluteAppUrl, appBaseUrl } from "@/lib/url";
import { downloadWhatsAppMedia, normalizeWhatsAppPhone, sendWhatsAppImage, sendWhatsAppText } from "@/lib/whatsapp";

export async function handleWhatsAppGreeting(from: string) {
  const phone = normalizeWhatsAppPhone(from);
  await sendWhatsAppText(
    phone,
    [
      "Namaste. Welcome to Yaadein AI.",
      "",
      "Send one old photo here. We will restore it and send a free watermarked preview on WhatsApp.",
      "",
      "Pay only if you like the preview."
    ].join("\n")
  );
}

export async function handleWhatsAppImage(input: {
  from: string;
  mediaId: string;
  mimeType?: string;
}) {
  const phone = normalizeWhatsAppPhone(input.from);

  await sendWhatsAppText(phone, "We received your memory. Restoring a preview now. This may take a few minutes.");

  const media = await downloadWhatsAppMedia(input.mediaId);
  const jobId = createJobId();
  const original = await saveImageBuffer(media.buffer, jobId, `original.${extensionForMime(input.mimeType ?? media.mimeType)}`);
  const job = await createJob({
    id: jobId,
    customerPhone: phone,
    sourceImagePath: original.absolutePath,
    sourceImageUrl: original.publicUrl,
    priceInr: 149,
    restorationStyle: "faithful"
  });

  const customer = await getCustomerByPhone(phone);
  const freePreviewLimit = Number(process.env.FREE_PREVIEW_LIMIT_PER_PHONE ?? 1);
  const canUseFreePreview = !customer || customer.freePreviewCount < freePreviewLimit;
  const payment = await ensurePaymentLinkForJob(job, appBaseUrl());

  if (!canUseFreePreview) {
    await updateJob(job.id, { status: "awaiting_payment" });
    await sendWhatsAppText(
      phone,
      [
        "This WhatsApp number has already used its free AI preview.",
        "",
        `Unlock this restore for INR ${job.priceInr}:`,
        payment.razorpayPaymentLinkUrl ?? absoluteAppUrl(`/preview/${job.sharePageSlug}`)
      ].join("\n")
    );
    return job;
  }

  await updateJob(job.id, { status: "restoring", failureReason: undefined });
  const result = await restorePhotoForJob({
    jobId: job.id,
    sourceImagePath: job.sourceImagePath ?? original.absolutePath,
    mode: "preview",
    style: job.restorationStyle
  });

  const updated = await updateJob(job.id, {
    status: "preview_ready",
    processingMode: result.provider,
    restoredPreviewPath: result.restoredPath,
    restoredPreviewUrl: result.restoredUrl,
    watermarkedPreviewPath: result.watermarkedPath,
    watermarkedPreviewUrl: result.watermarkedUrl,
    previewCostUsd: result.estimatedCostUsd
  });
  await incrementFreePreviewCount(phone);

  if (updated?.watermarkedPreviewUrl) {
    await sendWhatsAppImage(
      phone,
      updated.watermarkedPreviewUrl,
      [
        "Your free watermarked preview is ready.",
        "",
        `Unlock HD restoration for INR ${updated.priceInr}:`,
        payment.razorpayPaymentLinkUrl ?? absoluteAppUrl(`/preview/${updated.sharePageSlug}`)
      ].join("\n")
    );
  } else {
    await sendWhatsAppText(phone, `Your preview is ready. Unlock HD here: ${payment.razorpayPaymentLinkUrl ?? absoluteAppUrl(`/preview/${job.sharePageSlug}`)}`);
  }

  return updated ?? job;
}

export async function deliverPaidWhatsAppJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return undefined;
  if (job.status === "delivered") return job;

  await updateJob(job.id, { status: "paid", failureReason: undefined });
  const sourceImagePath = job.sourceImagePath;
  if (!sourceImagePath) {
    await updateJob(job.id, { status: "manual_review", failureReason: "No source image path exists for WhatsApp HD delivery." });
    return undefined;
  }

  const hdResult = job.restoredHdUrl
    ? undefined
    : await restorePhotoForJob({
        jobId: job.id,
        sourceImagePath,
        mode: "hd",
        style: job.restorationStyle
      });

  const updated = hdResult
    ? await updateJob(job.id, {
        status: "hd_ready",
        processingMode: hdResult.provider,
        restoredHdPath: hdResult.restoredPath,
        restoredHdUrl: hdResult.restoredUrl,
        beforeAfterSharePath: hdResult.beforeAfterSharePath,
        beforeAfterShareUrl: hdResult.beforeAfterShareUrl,
        hdCostUsd: hdResult.estimatedCostUsd
      })
    : job;

  if (!updated?.restoredHdUrl) return updated;

  await sendWhatsAppImage(updated.customerPhone, updated.restoredHdUrl, "Your clean HD restored photo is ready.");

  if (updated.beforeAfterShareUrl) {
    await sendWhatsAppImage(updated.customerPhone, updated.beforeAfterShareUrl, "Here is your before/after share image for family.");
  }

  await updateJob(updated.id, { status: "delivered" });
  await sendWhatsAppText(updated.customerPhone, "Thank you for trusting Yaadein AI. Your memories deserve HD.");
  return getJob(updated.id);
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}
