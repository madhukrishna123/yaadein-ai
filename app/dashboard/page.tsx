import { Clock3, ImageUp, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

const jobs = [
  { id: "YA-1042", title: "Grandparents wedding photo", status: "Preview ready", icon: Sparkles },
  { id: "YA-1041", title: "Childhood school portrait", status: "Restoring", icon: Clock3 },
  { id: "YA-1040", title: "Old album scan", status: "Delivered", icon: ImageUp }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Customer dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold">Your Yaadein AI restores</h1>
          </div>
          <Link className="rounded-[8px] bg-heirloom px-4 py-3 font-semibold text-ink" href="/">
            New restore
          </Link>
        </div>
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div className="glass-panel flex items-center justify-between rounded-[8px] p-5" key={job.id}>
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-heirloom/14 text-heirloom">
                  <job.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-[#b9ac9a]">{job.id}</p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm">
                {job.status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[8px] border border-mintglass/20 bg-mintglass/10 p-5">
          <p className="flex items-center gap-2 font-semibold text-mintglass">
            <MessageCircle size={18} /> WhatsApp-first
          </p>
          <p className="mt-2 text-[#d8cbb9]">
            In production, this history is linked to the user&apos;s WhatsApp phone number.
          </p>
        </div>
      </div>
    </main>
  );
}
