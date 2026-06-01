import { ArrowLeft, BadgeIndianRupee, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RealBeforeAfter } from "@/components/RealBeforeAfter";
import { PreviewLiveStatus } from "@/components/PreviewLiveStatus";
import { ShareButton } from "@/components/ShareButton";
import { getJobBySlug } from "@/lib/job-repository";
import { getPaymentForJob } from "@/lib/payment-repository";
import { getRestorationStyle } from "@/lib/yaadein-data";

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const payment = await getPaymentForJob(job.id);
  const isPaid = payment?.status === "paid" || ["paid", "hd_ready", "delivered"].includes(job.status);
  const isHdReady = Boolean(job.restoredHdUrl);
  const afterUrl = isHdReady && job.restoredHdUrl ? job.restoredHdUrl : job.watermarkedPreviewUrl;
  const isReady = Boolean(afterUrl);
  const needsPaymentBeforePreview = job.status === "awaiting_payment" && !isReady && !isPaid;
  const hdDownloadUrl = `/api/jobs/${job.id}/download/hd`;
  const shareDownloadUrl = `/api/jobs/${job.id}/download/share`;
  const restorationStyle = getRestorationStyle(job.restorationStyle);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm text-[#cdbfab]" href="/">
          <ArrowLeft size={16} /> Back to Yaadein
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <RealBeforeAfter beforeUrl={job.sourceImageUrl} afterUrl={afterUrl} />
          <aside className="glass-panel rounded-[8px] p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">
              {needsPaymentBeforePreview ? "Unlock required" : isReady ? "Preview ready" : "Preview pending"}
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              {needsPaymentBeforePreview ? "Unlock this restore to continue." : isReady ? "Your restored memory is waiting." : "Your memory is being prepared."}
            </h1>
            <p className="mt-4 leading-7 text-[#cdbfab]">
              {isHdReady
                ? "Your clean HD restoration is ready. Save it now or share this page with family."
                : isPaid
                  ? "Payment is complete. Generate the watermark-free HD restoration when you are ready."
                  : needsPaymentBeforePreview
                    ? "This WhatsApp number has already used its free AI preview. Unlock this restore to generate the paid HD result."
                    : isReady
                    ? "This free preview includes a Yaadein watermark. Unlock HD to receive the clean image."
                    : "Keep this page open. We will update it automatically when your preview is ready."}
            </p>
            <div className="mt-6 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-[#d8cbb9]">
              Restoration ID: <span className="text-heirloom">{job.id}</span>
              <br />
              Status: <span className="text-heirloom">{job.status}</span>
              <br />
              Style: <span className="text-heirloom">{restorationStyle.name}</span>
              <br />
              Payment: <span className="text-heirloom">{isPaid ? "paid" : payment?.status ?? "not started"}</span>
            </div>
            {!isReady && !isPaid && !needsPaymentBeforePreview ? (
              <PreviewLiveStatus slug={job.sharePageSlug} initialStatus={job.status} />
            ) : isHdReady && job.restoredHdUrl ? (
              <div className="mt-6 grid gap-3">
                <a
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink"
                  href={hdDownloadUrl}
                >
                  <Download size={18} /> Download HD photo
                </a>
                {job.beforeAfterShareUrl ? (
                  <a
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-heirloom/35 bg-heirloom/10 px-5 py-3 font-semibold text-heirloom"
                    href={shareDownloadUrl}
                  >
                    <Share2 size={18} /> Download before/after share image
                  </a>
                ) : null}
              </div>
            ) : isPaid ? (
              <form action={`/api/jobs/${job.id}/export-hd`} method="post">
                <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink" type="submit">
                  <Download size={18} /> Generate HD export
                </button>
              </form>
            ) : isReady ? (
              <form action={`/api/jobs/${job.id}/payment-link`} method="post">
                <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink" type="submit">
                  <BadgeIndianRupee size={18} /> Unlock HD for INR {job.priceInr}
                </button>
              </form>
            ) : null}
            {!isPaid && payment?.razorpayPaymentLinkId ? (
              <form action={`/api/jobs/${job.id}/payment-refresh`} method="post">
                <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-heirloom/35 bg-heirloom/10 px-4 py-3 text-sm font-semibold text-heirloom" type="submit">
                  I have paid, refresh status
                </button>
              </form>
            ) : null}
            {afterUrl ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ShareButton url={job.beforeAfterShareUrl ?? job.restoredHdUrl ?? afterUrl ?? `/preview/${job.sharePageSlug}`} />
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm"
                  href={isPaid && isHdReady ? hdDownloadUrl : afterUrl}
                >
                  <Download size={16} /> Save
                </a>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
