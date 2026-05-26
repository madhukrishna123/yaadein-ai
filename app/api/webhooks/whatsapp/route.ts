import { NextRequest, NextResponse } from "next/server";
import { handleWhatsAppGreeting, handleWhatsAppImage } from "@/lib/whatsapp-workflow";
import { hasWhatsAppConfig, whatsappVerifyToken } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === whatsappVerifyToken()) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as WhatsAppWebhookPayload | null;

  if (!payload) {
    return NextResponse.json({ received: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!hasWhatsAppConfig()) {
    return NextResponse.json({ received: true, configured: false });
  }

  const messages = extractMessages(payload);

  for (const message of messages) {
    if (message.type === "image" && message.image?.id) {
      await handleWhatsAppImage({
        from: message.from,
        mediaId: message.image.id,
        mimeType: message.image.mime_type
      });
      continue;
    }

    if (message.type === "text") {
      await handleWhatsAppGreeting(message.from);
    }
  }

  return NextResponse.json({ received: true, messages: messages.length });
}

function extractMessages(payload: WhatsAppWebhookPayload) {
  return (payload.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => change.value.messages ?? [])
  );
}

type WhatsAppWebhookPayload = {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: Array<{
          from: string;
          id: string;
          timestamp?: string;
          type: "text" | "image" | string;
          text?: {
            body?: string;
          };
          image?: {
            id?: string;
            mime_type?: string;
            sha256?: string;
            caption?: string;
          };
        }>;
      };
    }>;
  }>;
};
