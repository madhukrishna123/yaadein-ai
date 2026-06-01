"use client";

import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PreviewLiveStatusProps = {
  slug: string;
  initialStatus: string;
};

type PreviewApiResponse = {
  preview?: {
    status: string;
    watermarkedPreviewUrl?: string;
    restoredHdUrl?: string;
  };
  error?: string;
};

export function PreviewLiveStatus({ slug, initialStatus }: PreviewLiveStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState(messageForStatus(initialStatus));
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkPreview() {
      try {
        const response = await fetch(`/api/preview/${slug}`, { cache: "no-store" });
        const data = (await response.json()) as PreviewApiResponse;
        const nextStatus = data.preview?.status ?? "unknown";

        if (cancelled) return;

        setStatus(nextStatus);
        setMessage(messageForStatus(nextStatus));

        if (data.preview?.watermarkedPreviewUrl || data.preview?.restoredHdUrl || nextStatus === "preview_ready") {
          setIsPolling(false);
          setMessage("Preview ready. Updating this page now.");
          router.refresh();
          return;
        }

        if (["failed", "manual_review", "awaiting_payment"].includes(nextStatus)) {
          setIsPolling(false);
        }
      } catch {
        if (!cancelled) {
          setMessage("Still checking. If this takes too long, refresh once.");
        }
      }
    }

    checkPreview();
    const interval = window.setInterval(checkPreview, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [router, slug]);

  return (
    <div className="mt-6 rounded-[8px] border border-heirloom/25 bg-heirloom/10 p-4 text-sm text-[#f5eadb]">
      <div className="flex items-start gap-3">
        {status === "failed" || status === "manual_review" ? (
          <AlertCircle className="mt-1 shrink-0 text-roseglass" size={18} />
        ) : isPolling ? (
          <Loader2 className="mt-1 shrink-0 animate-spin text-heirloom" size={18} />
        ) : (
          <CheckCircle2 className="mt-1 shrink-0 text-mintglass" size={18} />
        )}
        <div>
          <p className="font-semibold text-[#fff7ea]">Live preview status</p>
          <p className="mt-1 leading-6 text-[#cdbfab]">{message}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-heirloom">Current: {readableStatus(status)}</p>
        </div>
      </div>
      <button
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-heirloom/35 bg-heirloom/10 px-4 py-3 font-semibold text-heirloom"
        onClick={() => router.refresh()}
        type="button"
      >
        <RefreshCw size={16} /> Refresh now
      </button>
    </div>
  );
}

function readableStatus(status: string) {
  return status.replace(/_/g, " ");
}

function messageForStatus(status: string) {
  switch (status) {
    case "photo_received":
      return "Photo received. Restoration will begin shortly.";
    case "restoring":
      return "We are restoring your preview. This usually takes 1-3 minutes.";
    case "preview_ready":
      return "Your preview is ready. Updating this page now.";
    case "awaiting_payment":
      return "This number has used its free preview. Unlock this restore to continue.";
    case "failed":
      return "We could not complete this restore. Try another style or upload a clearer photo.";
    case "manual_review":
      return "This photo needs support review before delivery.";
    default:
      return "Preparing your preview. Please keep this page open.";
  }
}
