"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ImageUp, Loader2, MessageCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { defaultPricingPlanId, getPricingPlan, loadingStates, pricingPlans } from "@/lib/yaadein-data";

type DemoState = "idle" | "uploaded" | "processing" | "ready";

export function FakeWhatsAppDemo() {
  const [state, setState] = useState<DemoState>("idle");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPricingPlanId);
  const visibleStates = useMemo(() => loadingStates.slice(0, state === "ready" ? 7 : 4), [state]);
  const selectedPlan = getPricingPlan(selectedPlanId);

  async function handleFile(file?: File) {
    if (!file) return;

    setFileName(file.name);
    setPreviewUrl("");
    setError("");
    setState("uploaded");

    try {
      const formData = new FormData();
      formData.append("phone", "+919999999999");
      formData.append("planId", selectedPlan.id);
      formData.append("photo", file);

      const uploadResponse = await fetch("/api/restoration/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json().catch(() => null);
        throw new Error(uploadError?.error ?? "Photo upload failed.");
      }

      const uploadData = (await uploadResponse.json()) as {
        job: { id: string; sharePageSlug: string };
      };

      setState("processing");

      const restoreResponse = await fetch(`/api/jobs/${uploadData.job.id}/restore`, {
        method: "POST"
      });

      if (!restoreResponse.ok) {
        const restoreError = await restoreResponse.json().catch(() => null);
        throw new Error(restoreError?.error ?? "Restoration failed.");
      }

      setPreviewUrl(`/preview/${uploadData.job.sharePageSlug}`);
      setState("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while restoring this photo.");
      setState("idle");
    }
  }

  return (
    <div className="glass-panel rounded-[8px] p-4">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-mintglass/20 text-mintglass">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-semibold">Yaadein AI</p>
            <p className="text-xs text-[#b9ac9a]">Private restoration studio</p>
          </div>
        </div>
        <span className="rounded-full bg-mintglass/14 px-3 py-1 text-xs text-mintglass">ready</span>
      </div>

      <div className="scrollbar-clean max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        <ChatBubble side="left">Upload one old photo. We will create a free watermarked restoration preview.</ChatBubble>
        <ChatBubble side="left">Scanned photos and clear phone pictures both work. Avoid glare for best results.</ChatBubble>

        <div className="grid gap-2">
          {pricingPlans.map((plan) => (
            <button
              className={`rounded-[8px] border px-3 py-2 text-left text-sm transition ${
                selectedPlanId === plan.id
                  ? "border-heirloom/70 bg-heirloom/15 text-[#fff7ea]"
                  : "border-white/10 bg-white/[0.04] text-[#cdbfab] hover:border-heirloom/40"
              }`}
              disabled={state === "processing"}
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span>{plan.name}</span>
                <span className="font-semibold text-heirloom">{plan.price}</span>
              </span>
            </button>
          ))}
        </div>

        {fileName ? (
          <ChatBubble side="right">
            <span className="flex items-center gap-2">
              <ImageUp size={16} />
              {fileName}
            </span>
          </ChatBubble>
        ) : null}

        <AnimatePresence>
          {state !== "idle" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ChatBubble side="left">Got it. This looks like a precious memory. Restoration has started.</ChatBubble>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {state === "processing" || state === "ready" ? (
          <div className="space-y-2">
            {visibleStates.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <ChatBubble side="left">
                  <span className="flex items-center gap-2">
                    {state === "ready" && index < visibleStates.length - 1 ? (
                      <Check className="text-mintglass" size={15} />
                    ) : (
                      <Loader2 className="animate-spin text-heirloom" size={15} />
                    )}
                    {item}
                  </span>
                </ChatBubble>
              </motion.div>
            ))}
          </div>
        ) : null}

        {state === "ready" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ChatBubble side="left">
              <span className="block">Your free preview is ready. Unlock {selectedPlan.name.toLowerCase()} for {selectedPlan.price}.</span>
              {previewUrl ? (
                <a className="mt-3 inline-flex text-heirloom underline" href={previewUrl}>
                  Open preview
                </a>
              ) : null}
            </ChatBubble>
          </motion.div>
        ) : null}

        {error ? (
          <ChatBubble side="left">
            <span className="text-roseglass">{error}</span>
          </ChatBubble>
        ) : null}
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm transition hover:border-heirloom/60">
        <span>{state === "processing" ? "Restoring..." : state === "idle" ? "Upload old photo" : "Restore another photo"}</span>
        {state === "processing" ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
        <input
          className="hidden"
          type="file"
          accept="image/*"
          disabled={state === "processing"}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </label>
    </div>
  );
}

function ChatBubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[8px] px-4 py-3 text-sm leading-relaxed ${
          side === "right"
            ? "bg-mintglass/20 text-[#f7fff9]"
            : "border border-white/10 bg-white/[0.07] text-[#f5eadb]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
