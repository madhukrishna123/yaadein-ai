import { updateJob } from "@/lib/job-repository";
import { getPaymentForJob, upsertPaymentLink } from "@/lib/payment-repository";
import { createRazorpayPaymentLink, hasRazorpayConfig } from "@/lib/razorpay";
import { appBaseUrl } from "@/lib/url";
import { RestorationJob } from "@/lib/mock-store";

export async function ensurePaymentLinkForJob(job: RestorationJob, baseUrl = appBaseUrl()) {
  if (!hasRazorpayConfig()) {
    throw new Error("Razorpay API keys are not configured.");
  }

  const existing = await getPaymentForJob(job.id);
  if (existing?.razorpayPaymentLinkUrl && ["created", "paid"].includes(existing.status)) {
    return existing;
  }

  const paymentLink = await createRazorpayPaymentLink({
    job,
    baseUrl
  });

  const payment = await upsertPaymentLink({
    jobId: job.id,
    amountInr: job.priceInr,
    status: paymentLink.status,
    razorpayPaymentLinkId: paymentLink.id,
    razorpayPaymentLinkUrl: paymentLink.url
  });

  if (job.status === "preview_ready") {
    await updateJob(job.id, { status: "awaiting_payment" });
  }

  return payment;
}
