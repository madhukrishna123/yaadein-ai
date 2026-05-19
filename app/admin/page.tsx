import {
  AlertTriangle,
  BadgeIndianRupee,
  BarChart3,
  Clock3,
  Database,
  ImageUp,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { jobStates } from "@/lib/yaadein-data";

type AdminJob = {
  id: string;
  customerPhone: string;
  status: string;
  priceInr: number;
  processingMode?: string;
  previewCostUsd?: number;
  hdCostUsd?: number;
  createdAt: string;
};

type AdminData = {
  jobs: AdminJob[];
  summary: {
    totalJobs: number;
    previewReady: number;
    paid: number;
    failed: number;
    manualReview: number;
    revenueInr: number;
    previewCostUsd: number;
    hdCostUsd: number;
    conversionRate: number;
    averagePreviewSeconds: number | null;
    storageMode: "database" | "memory";
  };
};

async function getAdminData(): Promise<AdminData> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  const response = await fetch(`${baseUrl}/api/admin/jobs`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to load admin jobs.");
  }

  return response.json();
}

export default async function AdminPage() {
  const data = await getAdminData();
  const totalAiCostUsd = data.summary.previewCostUsd + data.summary.hdCostUsd;
  const metrics = [
    { label: "Total jobs", value: data.summary.totalJobs, icon: ImageUp },
    { label: "Preview ready", value: data.summary.previewReady, icon: Sparkles },
    { label: "Paid unlocks", value: data.summary.paid, icon: BadgeIndianRupee },
    { label: "Conversion", value: `${data.summary.conversionRate}%`, icon: BarChart3 },
    { label: "Revenue", value: `INR ${data.summary.revenueInr}`, icon: BadgeIndianRupee },
    { label: "AI cost", value: `$${totalAiCostUsd.toFixed(2)}`, icon: BarChart3 },
    { label: "Failed", value: data.summary.failed, icon: AlertTriangle },
    { label: "Manual review", value: data.summary.manualReview, icon: Clock3 },
    { label: "Storage", value: data.summary.storageMode, icon: Database },
    { label: "Avg preview", value: data.summary.averagePreviewSeconds ? `${data.summary.averagePreviewSeconds}s` : "Pending", icon: Clock3 }
  ];

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Admin Agent</p>
            <h1 className="mt-3 text-4xl font-semibold">Yaadein AI operations</h1>
          </div>
          <a className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3" href="/admin">
            <RefreshCw size={17} /> Refresh
          </a>
        </div>

        <div className="mb-6 rounded-[8px] border border-white/10 bg-white/[0.05] p-4 text-sm text-[#d8cbb9]">
          Admin data source: <span className="font-semibold text-heirloom">{data.summary.storageMode}</span>. Configure `DATABASE_URL` and run `db/schema.sql` to switch from memory to database.
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((metric) => (
            <div className="glass-panel rounded-[8px] p-4" key={metric.label}>
              <metric.icon className="mb-4 text-heirloom" size={19} />
              <p className="text-2xl font-semibold">{metric.value}</p>
              <p className="mt-1 text-sm leading-5 text-[#b9ac9a]">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.62fr]">
          <section className="glass-panel rounded-[8px] p-5">
            <h2 className="text-xl font-semibold">Recent jobs</h2>
            <div className="mt-5 space-y-3">
              {data.jobs.map((job) => (
                <div className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.04] p-4" key={job.id}>
                  <div>
                    <p className="font-semibold">{job.id}</p>
                    <p className="text-sm text-[#b9ac9a]">{maskPhone(job.customerPhone)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-heirloom">{job.status}</p>
                    <p className="text-sm text-[#b9ac9a]">
                      INR {job.priceInr} · ${Number((job.previewCostUsd ?? 0) + (job.hdCostUsd ?? 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {data.jobs.length === 0 ? <p className="text-[#b9ac9a]">No jobs yet.</p> : null}
            </div>
          </section>

          <section className="glass-panel rounded-[8px] p-5">
            <h2 className="text-xl font-semibold">MVP job states</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {jobStates.map((state) => (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-[#d8cbb9]" key={state}>
                  {state}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function maskPhone(phone: string) {
  if (!phone || phone === "unknown") return "unknown";
  const last = phone.slice(-3);
  return `${phone.slice(0, 3)} *** *** ${last}`;
}
