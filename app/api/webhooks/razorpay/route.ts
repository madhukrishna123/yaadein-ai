import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    received: true,
    mode: "webhook-placeholder",
    nextStep: "Verify Razorpay signature, mark payment paid, and trigger HD export."
  });
}
