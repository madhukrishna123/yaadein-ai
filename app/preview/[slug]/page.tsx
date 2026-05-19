import { ArrowLeft, BadgeIndianRupee, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm text-[#cdbfab]" href="/">
          <ArrowLeft size={16} /> Back to Yaadein AI
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <BeforeAfter />
          <aside className="glass-panel rounded-[8px] p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Preview ready</p>
            <h1 className="mt-4 text-3xl font-semibold">Your restored memory is waiting.</h1>
            <p className="mt-4 leading-7 text-[#cdbfab]">
              This free preview includes a Yaadein AI watermark. Unlock HD to receive the clean image
              on WhatsApp.
            </p>
            <div className="mt-6 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-[#d8cbb9]">
              Restoration ID: <span className="text-heirloom">{slug}</span>
            </div>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink">
              <BadgeIndianRupee size={18} /> Unlock HD for INR 149
            </button>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm">
                <Share2 size={16} /> Share
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm">
                <Download size={16} /> Save
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
