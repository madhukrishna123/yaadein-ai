"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ImageUp, Loader2, MessageCircle, RotateCcw, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  defaultPricingPlanId,
  defaultRestorationStyleId,
  getPricingPlan,
  getRestorationStyle,
  loadingStates,
  pricingPlans,
  restorationStyles
} from "@/lib/yaadein-data";
import { YaadeinLogo } from "@/components/YaadeinLogo";

type DemoState = "idle" | "selected" | "uploading" | "checking" | "restoring" | "ready" | "failed";

const progressSteps: Array<{ id: DemoState; label: string; detail: string }> = [
  { id: "selected", label: "Photo selected", detail: "Your memory is ready to upload." },
  { id: "uploading", label: "Uploading photo", detail: "Sending your photo securely." },
  { id: "checking", label: "Checking quality", detail: "Making sure the image can be restored well." },
  { id: "restoring", label: "Restoring preview", detail: "Creating your watermarked preview." },
  { id: "ready", label: "Preview ready", detail: "View the result before paying." }
];

export function FakeWhatsAppDemo() {
  const [state, setState] = useState<DemoState>("idle");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPricingPlanId);
  const [selectedStyleId, setSelectedStyleId] = useState(defaultRestorationStyleId);
  const visibleStates = useMemo(() => loadingStates.slice(0, state === "ready" ? 7 : 4), [state]);
  const selectedPlan = getPricingPlan(selectedPlanId);
  const selectedStyle = getRestorationStyle(selectedStyleId);
  const isBusy = state === "uploading" || state === "checking" || state === "restoring";
  const currentProgressIndex = progressIndexForState(state);
  const statusHeadline = headlineForState(state);
  const statusMessage = messageForState(state, selectedStyle.name);

  async function handleFile(file?: File) {
    if (!file) return;

    const normalizedPhone = normalizePhone(phoneInputRef.current?.value ?? phone);
    if (!normalizedPhone) {
      setError("Enter a valid WhatsApp number before uploading.");
      return;
    }

    setFileName(file.name);
    setPreviewUrl("");
    setError("");
    setState("selected");

    try {
      const formData = new FormData();
      formData.append("phone", normalizedPhone);
      formData.append("planId", selectedPlan.id);
      formData.append("restorationStyle", selectedStyle.id);
      formData.append("photo", file);

      setState("uploading");
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
      const nextPreviewUrl = `/preview/${uploadData.job.sharePageSlug}`;

      setState("checking");
      await waitForStatusBeat();
      setState("restoring");

      const restoreResponse = await fetch(`/api/jobs/${uploadData.job.id}/restore`, {
        method: "POST"
      });

      if (!restoreResponse.ok) {
        const restoreError = await restoreResponse.json().catch(() => null);
        if (restoreResponse.status === 402 && restoreError?.paymentRequired) {
          setPreviewUrl(nextPreviewUrl);
          setState("ready");
          setError("Free preview limit reached for this WhatsApp number. Unlock this restore to continue.");
          return;
        }
        throw new Error(restoreError?.error ?? "Restoration failed.");
      }

      setPreviewUrl(nextPreviewUrl);
      setState("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while restoring this photo.");
      setState("failed");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
            <YaadeinLogo markClassName="hidden" textClassName="text-base" />
            <p className="text-xs text-[#b9ac9a]">Private restoration studio</p>
          </div>
        </div>
        <span className="rounded-full bg-mintglass/14 px-3 py-1 text-xs text-mintglass">ready</span>
      </div>

      <div className="scrollbar-clean max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        <ChatBubble side="left">Upload one old photo. We will create a free watermarked restoration preview.</ChatBubble>
        <ChatBubble side="left">Scanned photos and clear phone pictures both work. Avoid glare for best results.</ChatBubble>

        <label className="grid gap-2 rounded-[8px] border border-white/10 bg-white/[0.05] p-3 text-sm text-[#f5eadb]">
          <span className="text-xs uppercase tracking-[0.16em] text-heirloom">WhatsApp number</span>
          <input
            className="w-full rounded-[8px] border border-white/12 bg-ink/50 px-3 py-2 text-[#fff7ea] outline-none transition placeholder:text-[#8b7e6c] focus:border-heirloom/70"
            disabled={isBusy}
            inputMode="tel"
            onChange={(event) => {
              setPhone(event.target.value);
              setError("");
              if (state === "failed") setState("idle");
            }}
            placeholder="+91 WhatsApp number"
            ref={phoneInputRef}
            type="tel"
            value={phone}
          />
        </label>

        <div className="grid gap-2">
          {pricingPlans.map((plan) => (
            <button
              className={`rounded-[8px] border px-3 py-2 text-left text-sm transition ${
                selectedPlanId === plan.id
                  ? "border-heirloom/70 bg-heirloom/15 text-[#fff7ea]"
                  : "border-white/10 bg-white/[0.04] text-[#cdbfab] hover:border-heirloom/40"
              }`}
              disabled={isBusy}
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

        <div className="grid gap-2">
          {restorationStyles.map((style) => (
            <button
              className={`rounded-[8px] border px-3 py-2 text-left text-sm transition ${
                selectedStyleId === style.id
                  ? "border-mintglass/70 bg-mintglass/12 text-[#f7fff9]"
                  : "border-white/10 bg-white/[0.04] text-[#cdbfab] hover:border-mintglass/40"
              }`}
              disabled={isBusy}
              key={style.id}
              onClick={() => {
                setSelectedStyleId(style.id);
                if (state === "ready" || state === "failed") {
                  setError("");
                  setPreviewUrl("");
                  setFileName("");
                  setState("idle");
                }
              }}
              type="button"
            >
              <span className="block font-semibold">{style.name}</span>
              <span className="mt-1 block text-xs leading-5 text-[#b9ac9a]">{style.description}</span>
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
              <StatusPanel
                currentIndex={currentProgressIndex}
                headline={statusHeadline}
                message={statusMessage}
                steps={progressSteps}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {state === "checking" || state === "restoring" || state === "ready" ? (
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
                    {state === "ready" || index < Math.min(visibleStates.length - 1, 2) ? (
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
              <span className="block">
                Your {selectedStyle.name.toLowerCase()} preview is ready. Unlock {selectedPlan.name.toLowerCase()} for {selectedPlan.price}.
              </span>
              <span className="mt-3 grid gap-2">
                {previewUrl ? (
                  <a className="inline-flex items-center justify-center rounded-[8px] bg-heirloom px-4 py-2 font-semibold text-ink" href={previewUrl}>
                    View preview
                  </a>
                ) : null}
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-heirloom/35 bg-heirloom/10 px-4 py-2 text-heirloom"
                  onClick={() => {
                    setError("");
                    setPreviewUrl("");
                    setFileName("");
                    setState("idle");
                    fileInputRef.current?.click();
                  }}
                  type="button"
                >
                  <RotateCcw size={15} /> Try another style
                </button>
              </span>
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
        <span>{buttonLabelForState(state)}</span>
        {isBusy ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
        <input
          className="hidden"
          type="file"
          accept="image/*"
          disabled={isBusy}
          onClick={(event) => {
            event.currentTarget.value = "";
          }}
          onChange={(event) => handleFile(event.target.files?.[0])}
          ref={fileInputRef}
        />
      </label>
    </div>
  );
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return "";
}

function progressIndexForState(state: DemoState) {
  if (state === "idle" || state === "failed") return -1;
  return progressSteps.findIndex((step) => step.id === state);
}

function headlineForState(state: DemoState) {
  switch (state) {
    case "selected":
      return "Photo selected";
    case "uploading":
      return "Uploading your photo";
    case "checking":
      return "Checking photo quality";
    case "restoring":
      return "Restoring your preview";
    case "ready":
      return "Your preview is ready";
    case "failed":
      return "We could not complete this restore";
    default:
      return "Choose a photo to restore";
  }
}

function messageForState(state: DemoState, styleName: string) {
  switch (state) {
    case "selected":
      return `We will use ${styleName} for this photo.`;
    case "uploading":
      return "Please keep this page open while the photo uploads.";
    case "checking":
      return "We are checking whether the image has enough detail for a faithful result.";
    case "restoring":
      return "This usually takes 1-3 minutes. We are preserving faces, framing, and the original feeling.";
    case "ready":
      return "See your restored preview before deciding to unlock the clean HD photo.";
    case "failed":
      return "Try the same photo again, choose another style, or upload a clearer image.";
    default:
      return "Upload one photo and we will guide you through each step.";
  }
}

function buttonLabelForState(state: DemoState) {
  switch (state) {
    case "uploading":
      return "Uploading...";
    case "checking":
      return "Checking photo...";
    case "restoring":
      return "Restoring preview...";
    case "ready":
      return "Upload another photo";
    case "failed":
      return "Try again";
    default:
      return "Upload old photo";
  }
}

function waitForStatusBeat() {
  return new Promise((resolve) => window.setTimeout(resolve, 550));
}

function StatusPanel({
  currentIndex,
  headline,
  message,
  steps
}: {
  currentIndex: number;
  headline: string;
  message: string;
  steps: Array<{ id: DemoState; label: string; detail: string }>;
}) {
  return (
    <div className="rounded-[8px] border border-heirloom/25 bg-heirloom/10 p-4 text-sm text-[#f5eadb]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#fff7ea]">{headline}</p>
          <p className="mt-1 leading-6 text-[#cdbfab]">{message}</p>
        </div>
        {currentIndex >= 0 && currentIndex < steps.length - 1 ? (
          <Loader2 className="mt-1 shrink-0 animate-spin text-heirloom" size={18} />
        ) : (
          <Check className="mt-1 shrink-0 text-mintglass" size={18} />
        )}
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isDone = currentIndex > index;
          const isCurrent = currentIndex === index;
          return (
            <div className="flex gap-3" key={step.id}>
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                  isDone
                    ? "border-mintglass bg-mintglass text-ink"
                    : isCurrent
                      ? "border-heirloom bg-heirloom text-ink"
                      : "border-white/18 bg-white/[0.04] text-[#8b7e6c]"
                }`}
              >
                {isDone ? <Check size={12} /> : index + 1}
              </span>
              <span>
                <span className={isCurrent || isDone ? "block font-semibold text-[#fff7ea]" : "block text-[#b9ac9a]"}>{step.label}</span>
                <span className="block text-xs leading-5 text-[#9f927f]">{step.detail}</span>
              </span>
            </div>
          );
        })}
      </div>
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
