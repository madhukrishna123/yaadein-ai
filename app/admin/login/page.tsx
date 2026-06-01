import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { hasAdminPassword } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    setup?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/admin";
  const needsSetup = !hasAdminPassword() || params.setup === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-sm">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm text-[#cdbfab] transition hover:text-heirloom" href="/">
          <ArrowLeft size={16} /> Back to Yaadein
        </Link>

        <div className="glass-panel rounded-[8px] p-6">
          <div className="mb-7 grid h-12 w-12 place-items-center rounded-[8px] border border-white/10 bg-white/[0.06] text-heirloom">
            <LockKeyhole size={22} />
          </div>
          <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Private Access</p>
          <h1 className="mt-3 text-3xl font-semibold">Operations login</h1>
          <p className="mt-3 text-sm leading-6 text-[#b9ac9a]">For Yaadein operators only.</p>
        </div>

        {needsSetup ? (
          <div className="mt-4 rounded-[8px] border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-[#ead9bd]">
            Admin access is not configured yet. Add <span className="font-semibold">ADMIN_PASSWORD</span> and{" "}
            <span className="font-semibold">ADMIN_SESSION_SECRET</span> to the environment, then restart the app.
          </div>
        ) : (
          <form action="/api/admin/login" autoComplete="off" className="mt-4 space-y-4" method="post">
            <input name="next" type="hidden" value={nextPath} />
            <input
              aria-label="Admin password"
              autoComplete="new-password"
              autoFocus
              placeholder="Password"
              className="w-full rounded-[8px] border border-white/12 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-heirloom"
              id="password"
              name="password"
              required
              type="password"
            />
            {params.error ? <p className="text-sm text-rose-300">Password did not match. Please try again.</p> : null}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-4 py-3 font-semibold text-[#16120f]" type="submit">
              <LockKeyhole size={18} /> Continue
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
