import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    customer: {
      whatsappPhone: "+919999999999",
      name: "Demo Customer"
    },
    messages: [
      "Namaste. Welcome to Yaadein.",
      "Send us one old photo and we will restore it into a clean HD memory.",
      "A scanned photo or a well-lit phone picture both work. Avoid glare if possible."
    ]
  });
}
