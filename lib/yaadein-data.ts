import {
  BadgeIndianRupee,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  ImageUp,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Users
} from "lucide-react";

export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919885711673";

export const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Restore my old photo"
)}`;

export const loadingStates = [
  "Receiving your memory",
  "Checking photo quality",
  "Cleaning dust and scratches",
  "Repairing faded details",
  "Restoring faces gently",
  "Balancing light and color",
  "Preserving the original feeling",
  "Creating your free preview",
  "Reviewing for natural results",
  "Preparing HD unlock"
];

export const pricingPlans = [
  {
    id: "launch-3",
    name: "Launch Offer",
    price: "INR 149",
    priceInr: 149,
    description: "Restore up to 3 old photos in HD. Includes free watermarked previews before payment."
  },
  {
    id: "single",
    name: "Single Memory",
    price: "INR 99",
    priceInr: 99,
    description: "Restore 1 old photo in HD. Best when you want to test one precious memory first."
  },
  {
    id: "family-10",
    name: "Family Archive",
    price: "INR 499",
    priceInr: 499,
    description: "Restore 10 photos for a family album, wedding set, anniversary, or gifting moment."
  }
];

export const defaultPricingPlanId = "launch-3";

export function getPricingPlan(planId: string | null | undefined) {
  return pricingPlans.find((plan) => plan.id === planId) ?? pricingPlans.find((plan) => plan.id === defaultPricingPlanId) ?? pricingPlans[0];
}

export const restorationStyles = [
  {
    id: "faithful",
    name: "Faithful Restore",
    description: "Conservative cleanup that preserves the original framing, people, faces, clothing, and scene."
  },
  {
    id: "recreate",
    name: "Memory Recreate",
    description: "A more magical AI recreation for heavily damaged photos where missing details may be reconstructed."
  }
] as const;

export const defaultRestorationStyleId = "faithful";

export function getRestorationStyle(styleId: string | null | undefined) {
  return restorationStyles.find((style) => style.id === styleId) ?? restorationStyles.find((style) => style.id === defaultRestorationStyleId) ?? restorationStyles[0];
}

export const adminMetrics = [
  { label: "WhatsApp chat starts", value: "184", icon: MessageCircle },
  { label: "Photos received", value: "72", icon: ImageUp },
  { label: "Valid photos accepted", value: "64", icon: CheckCircle2 },
  { label: "Restoration jobs created", value: "64", icon: Bot },
  { label: "Free previews generated", value: "58", icon: Sparkles },
  { label: "Preview conversion", value: "24%", icon: BarChart3 },
  { label: "Paid HD unlocks", value: "14", icon: BadgeIndianRupee },
  { label: "Revenue collected", value: "INR 2,086", icon: BadgeIndianRupee },
  { label: "Failed jobs", value: "3", icon: RefreshCw },
  { label: "Avg preview time", value: "3m 42s", icon: Clock3 }
];

export const agents = [
  {
    name: "Memory Concierge Agent",
    owner: "WhatsApp flow",
    description: "Greets users, receives photos, sends progress updates, and handles simple support."
  },
  {
    name: "Restoration Agent",
    owner: "OpenAI image engine",
    description: "Creates restored previews and HD exports while preserving identity and authenticity."
  },
  {
    name: "Quality Agent",
    owner: "Natural results",
    description: "Flags fake-looking results, over-smoothing, and failed restorations before delivery."
  },
  {
    name: "Payment Agent",
    owner: "Razorpay unlock",
    description: "Creates payment links, handles payment status, and unlocks HD delivery."
  },
  {
    name: "Delivery Agent",
    owner: "Final handoff",
    description: "Sends HD images, download links, and share links back to the user on WhatsApp."
  },
  {
    name: "Marketing Agent",
    owner: "Growth",
    description: "Creates reels, referral prompts, partnership copy, and launch experiments."
  }
];

export const jobStates = [
  "received",
  "quality_check",
  "restoring",
  "preview_ready",
  "payment_pending",
  "paid",
  "export_ready",
  "delivered",
  "failed"
];
