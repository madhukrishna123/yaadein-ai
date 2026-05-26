import { absoluteAppUrl } from "@/lib/url";

type WhatsAppMedia = {
  id: string;
  mime_type?: string;
  sha256?: string;
  url?: string;
};

type WhatsAppMessageResponse = {
  messages?: Array<{ id: string }>;
};

export function hasWhatsAppConfig() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function whatsappVerifyToken() {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? process.env.WHATSAPP_VERIFY_TOKEN;
}

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export async function getWhatsAppMedia(mediaId: string) {
  return whatsappRequest<WhatsAppMedia>(`/${mediaId}`, {
    method: "GET"
  });
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const media = await getWhatsAppMedia(mediaId);
  if (!media.url) {
    throw new Error("WhatsApp media URL is missing.");
  }

  const response = await fetch(media.url, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to download WhatsApp media.");
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    mimeType: media.mime_type ?? response.headers.get("content-type") ?? "image/jpeg"
  };
}

export async function sendWhatsAppText(to: string, body: string) {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneDigits(to),
    type: "text",
    text: {
      preview_url: true,
      body
    }
  });
}

export async function sendWhatsAppImage(to: string, imageUrl: string, caption?: string) {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneDigits(to),
    type: "image",
    image: {
      link: absoluteAppUrl(imageUrl),
      caption
    }
  });
}

async function sendWhatsAppMessage(body: Record<string, unknown>) {
  if (!hasWhatsAppConfig()) {
    throw new Error("WhatsApp API is not configured.");
  }

  return whatsappRequest<WhatsAppMessageResponse>(`/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

async function whatsappRequest<T>(path: string, init: RequestInit) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error("WhatsApp access token is not configured.");
  }

  const response = await fetch(`https://graph.facebook.com/v20.0${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error?.message ?? "WhatsApp API request failed.";
    throw new Error(message);
  }

  return data as T;
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}
