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
      "Namaste. Welcome to Yaadein.",
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
  return createWhatsAppImageJob(input);
}

export async function createWhatsAppImageJob(input: {
  from: string;
  mediaId: string;
  mimeType?: string;
}) {
  const phone = normalizeWhatsAppPhone(input.from);

  await sendWhatsAppText(
    phone,
    [
      "We received your memory.",
      "",
      "We are saving it securely now. You will receive a preview here once restoration is complete."
    ].join("\n")
  );

  const media = await downloadWhatsAppMedia(input.mediaId);
  const jobId = createJobId();
  const original = await saveImageBuffer(media.buffer, jobId, `original.${extensionForMime(input.mimeType ?? media.mimeType)}`);
  const job = await createJob({
    id: jobId,
    customerPhone: phone,
    sourceImagePath: original.absolutePath,
    sourceImageUrl: original.publicUrl,
    priceInr: 149,
    restorationStyle: "natural"
  });

  await sendWhatsAppText(
    phone,
    [
      `Your restoration ID is ${job.id}.`,
      "",
      "Status page:",
      absoluteAppUrl(`/preview/${job.sharePageSlug}`)
    ].join("\n")
  );

  return job;
}

export async function processWhatsAppPreviewJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return undefined;
  if (job.status !== "photo_received" && job.status !== "restoring") return job;

  const phone = job.customerPhone;
  await sendWhatsAppText(
    phone,
    [
      "We are restoring your free preview now.",
      "",
      "This usually takes 1-3 minutes. You do not need to do anything."
    ].join("\n")
  );

  const customer = await getCustomerByPhone(phone);
  const freePreviewLimit = Number(process.env.FREE_PREVIEW_LIMIT_PER_PHONE ?? 1);
  const canUseFreePreview = !customer || customer.freePreviewCount < freePreviewLimit;
  const payment = await ensurePaymentLinkForJob(job, appBaseUrl());
  const paymentUrl = payment.razorpayPaymentLinkUrl ?? absoluteAppUrl(`/preview/${job.sharePageSlug}`);

  if (!canUseFreePreview) {
    await updateJob(job.id, { status: "awaiting_payment" });
    await sendWhatsAppText(
      phone,
      buildUpiPaymentMessage({
        priceInr: job.priceInr,
        paymentUrl,
        intro: "This WhatsApp number has already used its free preview."
      })
    );
    return job;
  }

  if (!job.sourceImagePath) {
    await updateJob(job.id, {
      status: "manual_review",
      failureReason: "No source image path exists for WhatsApp preview."
    });
    await sendWhatsAppText(
      phone,
      [
        "We could not prepare this photo automatically.",
        "",
        "Our team will review it and help you shortly."
      ].join("\n")
    );
    return undefined;
  }

  await updateJob(job.id, { status: "restoring", failureReason: undefined });
  const result = await restorePhotoForJob({
    jobId: job.id,
    sourceImagePath: job.sourceImagePath,
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
      buildUpiPaymentMessage({
        priceInr: updated.priceInr,
        paymentUrl,
        intro: "Your free watermarked preview is ready."
      })
    );
  } else {
    await sendWhatsAppText(
      phone,
      buildUpiPaymentMessage({
        priceInr: job.priceInr,
        paymentUrl,
        intro: "Your preview is ready."
      })
    );
  }

  return updated ?? job;
}

export async function deliverPaidWhatsAppJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return undefined;
  if (job.status === "delivered") return job;

  await updateJob(job.id, { status: "paid", failureReason: undefined });
  await sendWhatsAppText(
    job.customerPhone,
    [
      "Payment received.",
      "",
      "We are preparing your clean HD photo now. It usually takes 1-3 minutes."
    ].join("\n")
  );

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
  await sendWhatsAppText(updated.customerPhone, "Thank you for trusting Yaadein. Your memories deserve HD.");
  return getJob(updated.id);
}

function buildUpiPaymentMessage(input: { intro: string; priceInr: number; paymentUrl: string }) {
  return [
    input.intro,
    "",
    "Like this preview?",
    `Pay INR ${input.priceInr} by UPI to receive the clean HD photo:`,
    input.paymentUrl,
    "",
    "You can use PhonePe, Google Pay, Paytm, BHIM, or any UPI app.",
    "After payment, we will send the HD photo here on WhatsApp."
  ].join("\n");
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}
