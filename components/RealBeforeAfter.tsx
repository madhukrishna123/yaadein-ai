"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export function RealBeforeAfter({
  beforeUrl,
  afterUrl
}: {
  beforeUrl: string;
  afterUrl?: string;
}) {
  const [position, setPosition] = useState(52);
  const finalAfterUrl = afterUrl || beforeUrl;

  return (
    <div className="glass-panel relative aspect-[4/5] w-full overflow-hidden rounded-[8px] bg-black sm:aspect-[16/11]">
      <img
        alt="Original uploaded memory"
        className="absolute inset-0 h-full w-full object-contain opacity-80"
        src={beforeUrl}
      />
      <img
        alt="Restored Yaadein preview"
        className="absolute inset-0 h-full w-full object-contain"
        src={finalAfterUrl}
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      />
      <div className="absolute inset-y-0 z-10 w-1 bg-[#fff7ea]" style={{ left: `${position}%` }}>
        <div className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-ink/80 shadow-glow">
          <span className="h-4 w-4 rounded-full bg-heirloom" />
        </div>
      </div>
      <input
        aria-label="Before and after slider"
        className="absolute inset-x-6 bottom-6 z-20 accent-heirloom"
        max="82"
        min="18"
        type="range"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
      />
      <div className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-medium">
        Before
      </div>
      <div className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-medium">
        Restored
      </div>
      {!afterUrl ? (
        <div className="absolute bottom-16 left-4 z-20 max-w-[15rem] rounded-[8px] border border-white/10 bg-black/60 p-3 text-xs text-[#eadfce] backdrop-blur">
          Preview is not ready yet.
        </div>
      ) : null}
    </div>
  );
}
