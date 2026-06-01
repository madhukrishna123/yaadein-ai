"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ url }: { url: string }) {
  async function handleShare() {
    const absoluteUrl = new URL(url, window.location.origin).toString();
    if (navigator.share) {
      await navigator.share({
        title: "Yaadein restoration",
        text: "See this restored memory from Yaadein.",
        url: absoluteUrl
      });
      return;
    }

    await navigator.clipboard.writeText(absoluteUrl);
    window.alert("Share link copied.");
  }

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm"
      onClick={handleShare}
      type="button"
    >
      <Share2 size={16} /> Share
    </button>
  );
}
