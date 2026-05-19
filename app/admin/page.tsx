import { RefreshCw } from "lucide-react";
import { adminMetrics, jobStates } from "@/lib/yaadein-data";

const recentJobs = [
  { id: "YA-1042", customer: "+91 98••• ••210", status: "preview_ready", amount: "INR 149" },
  { id: "YA-1041", customer: "+91 77••• ••881", status: "restoring", amount: "Pending" },
  { id: "YA-1040", customer: "+91 90••• ••433", status: "delivered", amount: "INR 399" },
  { id: "YA-1039", customer: "+91 82••• ••014", status: "manual_review", amount: "Pending" }
];

export default function AdminPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Admin Agent</p>
            <h1 className="mt-3 text-4xl font-semibold">Yaadein AI operations</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3">
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {adminMetrics.map((metric) => (
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
              {recentJobs.map((job) => (
                <div className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.04] p-4" key={job.id}>
                  <div>
                    <p className="font-semibold">{job.id}</p>
                    <p className="text-sm text-[#b9ac9a]">{job.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-heirloom">{job.status}</p>
                    <p className="text-sm text-[#b9ac9a]">{job.amount}</p>
                  </div>
                </div>
              ))}
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
