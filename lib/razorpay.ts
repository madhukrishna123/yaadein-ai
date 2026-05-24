import { RestorationJob } from "@/lib/mock-store";

type RazorpayPaymentLink = {
  id: string;
  short_url?: string;
  status: string;
  payments?: Array<{ payment_id?: string }>;
};

type PaymentStatus = "created" | "paid" | "cancelled" | "expired";

export function hasRazorpayConfig() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayPaymentLink(input: {
  job: RestorationJob;
  baseUrl: string;
}) {
  const amountInr = input.job.priceInr;
  const response = await razorpayRequest<RazorpayPaymentLink>("/payment_links", {
    method: "POST",
    body: JSON.stringify({
      amount: amountInr * 100,
      currency: "INR",
      accept_partial: false,
      description: `Yaadein AI HD restore ${input.job.id}`,
      customer: {
        contact: input.job.customerPhone !== "unknown" ? input.job.customerPhone : undefined
      },
      notify: {
        sms: true,
        email: false
      },
      reminder_enable: true,
      callback_url: `${input.baseUrl}/preview/${input.job.sharePageSlug}`,
      callback_method: "get",
      notes: {
        job_id: input.job.id,
        share_page_slug: input.job.sharePageSlug
      }
    })
  });

  if (!response.short_url) {
    throw new Error("Razorpay did not return a payment link URL.");
  }

  return {
    id: response.id,
    url: response.short_url,
    status: normalizeRazorpayPaymentStatus(response.status)
  };
}

export async function getRazorpayPaymentLink(paymentLinkId: string) {
  const response = await razorpayRequest<RazorpayPaymentLink>(`/payment_links/${paymentLinkId}`, {
    method: "GET"
  });

  return {
    id: response.id,
    url: response.short_url,
    status: normalizeRazorpayPaymentStatus(response.status),
    paymentId: response.payments?.find((payment) => payment.payment_id)?.payment_id
  };
}

function normalizeRazorpayPaymentStatus(status: string): PaymentStatus {
  if (status === "paid") return "paid";
  if (status === "cancelled") return "cancelled";
  if (status === "expired") return "expired";
  return "created";
}

async function razorpayRequest<T>(path: string, init: RequestInit) {
  if (!hasRazorpayConfig()) {
    throw new Error("Razorpay API keys are not configured.");
  }

  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.description ?? data?.error?.reason ?? "Razorpay request failed.";
    throw new Error(message);
  }

  return data as T;
}
