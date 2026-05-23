import { ArrowLeft, BadgeIndianRupee, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RealBeforeAfter } from "@/components/RealBeforeAfter";
import { getJobBySlug } from "@/lib/job-repository";

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const afterUrl = job.watermarkedPreviewUrl || job.restoredPreviewUrl || job.restoredHdUrl;
  const isReady = Boolean(afterUrl);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm text-[#cdbfab]" href="/">
          <ArrowLeft size={16} /> Back to Yaadein AI
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <RealBeforeAfter beforeUrl={job.sourceImageUrl} afterUrl={afterUrl} />
          <aside className="glass-panel rounded-[8px] p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">
              {isReady ? "Preview ready" : "Preview pending"}
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              {isReady ? "Your restored memory is waiting." : "Your memory is being prepared."}
            </h1>
            <p className="mt-4 leading-7 text-[#cdbfab]">
              {isReady
                ? "This free preview includes a Yaadein AI watermark. Unlock HD to receive the clean image on WhatsApp."
                : "Refresh this page after restoration completes to see the watermarked preview."}
            </p>
            <div className="mt-6 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-[#d8cbb9]">
              Restoration ID: <span className="text-heirloom">{job.id}</span>
              <br />
              Status: <span className="text-heirloom">{job.status}</span>
            </div>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink">
              <BadgeIndianRupee size={18} /> Unlock HD for INR {job.priceInr}
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
