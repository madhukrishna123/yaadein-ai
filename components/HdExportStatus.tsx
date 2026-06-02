"use client";

import { AlertCircle, CheckCircle2, Download, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type HdExportStatusProps = {
  jobId: string;
};

type ExportState = "idle" | "starting" | "generating" | "ready" | "failed";

export function HdExportStatus({ jobId }: HdExportStatusProps) {
  const router = useRouter();
  const startedRef = useRef(false);
  const [state, setState] = useState<ExportState>("idle");
  const [message, setMessage] = useState("Payment received. Your HD export is ready to generate.");

  const generateHdExport = useCallback(async () => {
    setState("starting");
    setMessage("Payment received. Starting your clean HD export now.");

    try {
      setState("generating");
      setMessage("Generating your watermark-free HD photo. This can take 1-3 minutes.");

      const response = await fetch(`/api/jobs/${jobId}/export-hd`, {
        method: "POST",
        headers: {
          Accept: "application/json"
        }
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "HD export failed.");
      }

      setState("ready");
      setMessage("Your clean HD photo is ready. Updating this page now.");
      router.refresh();
    } catch (error) {
      setState("failed");
      setMessage(error instanceof Error ? error.message : "Something went wrong while generating the HD export.");
    }
  }, [jobId, router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void generateHdExport();
  }, [generateHdExport]);

  const isBusy = state === "starting" || state === "generating";

  return (
    <div className="mt-6 rounded-[8px] border border-heirloom/25 bg-heirloom/10 p-4 text-sm text-[#f5eadb]">
      <div className="flex items-start gap-3">
        {state === "failed" ? (
          <AlertCircle className="mt-1 shrink-0 text-roseglass" size={18} />
        ) : isBusy ? (
          <Loader2 className="mt-1 shrink-0 animate-spin text-heirloom" size={18} />
        ) : state === "ready" ? (
          <CheckCircle2 className="mt-1 shrink-0 text-mintglass" size={18} />
        ) : (
          <Download className="mt-1 shrink-0 text-heirloom" size={18} />
        )}
        <div>
          <p className="font-semibold text-[#fff7ea]">HD export status</p>
          <p className="mt-1 leading-6 text-[#cdbfab]">{message}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-heirloom">Current: {readableState(state)}</p>
        </div>
      </div>
      <button
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-heirloom/35 bg-heirloom/10 px-4 py-3 font-semibold text-heirloom disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy}
        onClick={() => {
          if (state === "ready") {
            router.refresh();
            return;
          }
          void generateHdExport();
        }}
        type="button"
      >
        {isBusy ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
        {isBusy ? "Generating HD..." : state === "ready" ? "Refresh page" : "Try HD export again"}
      </button>
    </div>
  );
}

function readableState(state: ExportState) {
  return state.replace(/_/g, " ");
}
