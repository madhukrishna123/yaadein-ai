"use client";

import { useState } from "react";

export function BeforeAfter() {
  const [position, setPosition] = useState(52);

  return (
    <div className="glass-panel photo-grain relative aspect-[4/5] w-full overflow-hidden rounded-[8px] sm:aspect-[16/11]">
      <div className="memory-photo before-photo" />
      <div className="memory-photo after-photo" style={{ clipPath: `inset(0 0 0 ${position}%)` }} />
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
      <div className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium">
        Before
      </div>
      <div className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium">
        Restored
      </div>
      <div className="absolute bottom-16 left-4 z-20 max-w-[14rem] rounded-[8px] border border-white/10 bg-black/50 p-3 text-xs text-[#eadfce] backdrop-blur">
        Preview watermark is removed after HD unlock.
      </div>
    </div>
  );
}
