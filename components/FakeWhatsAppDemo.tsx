"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ImageUp, Loader2, MessageCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { loadingStates } from "@/lib/yaadein-data";

type DemoState = "idle" | "uploaded" | "processing" | "ready";

export function FakeWhatsAppDemo() {
  const [state, setState] = useState<DemoState>("idle");
  const [fileName, setFileName] = useState("");
  const visibleStates = useMemo(() => loadingStates.slice(0, state === "ready" ? 7 : 4), [state]);

  function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setState("uploaded");
    window.setTimeout(() => setState("processing"), 650);
    window.setTimeout(() => setState("ready"), 3200);
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
            <p className="text-xs text-[#b9ac9a]">Business account</p>
          </div>
        </div>
        <span className="rounded-full bg-mintglass/14 px-3 py-1 text-xs text-mintglass">online</span>
      </div>

      <div className="scrollbar-clean max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        <ChatBubble side="left">Namaste. Send us one old photo and we will restore it into a clean HD memory.</ChatBubble>
        <ChatBubble side="left">A scanned photo or a well-lit phone picture both work. Avoid glare if possible.</ChatBubble>

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
              <ChatBubble side="left">Got it. This looks like a precious memory. We are starting the restoration now.</ChatBubble>
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
              Your free preview is ready. Unlock the HD photo without watermark for INR 149.
            </ChatBubble>
          </motion.div>
        ) : null}
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm transition hover:border-heirloom/60">
        <span>{state === "idle" ? "Choose an old photo" : "Try another photo"}</span>
        <Send size={17} />
        <input
          className="hidden"
          type="file"
          accept="image/*"
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
