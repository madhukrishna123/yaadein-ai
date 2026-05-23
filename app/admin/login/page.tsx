import { LockKeyhole, Sparkles } from "lucide-react";
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
      <section className="glass-panel w-full max-w-md rounded-[8px] p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Admin Agent</p>
            <h1 className="mt-3 text-3xl font-semibold">Operator login</h1>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.06] p-3 text-heirloom">
            <LockKeyhole size={22} />
          </div>
        </div>

        {needsSetup ? (
          <div className="rounded-[8px] border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-[#ead9bd]">
            Admin access is not configured yet. Add <span className="font-semibold">ADMIN_PASSWORD</span> and{" "}
            <span className="font-semibold">ADMIN_SESSION_SECRET</span> to the environment, then restart the app.
          </div>
        ) : (
          <form action="/api/admin/login" className="space-y-4" method="post">
            <input name="next" type="hidden" value={nextPath} />
            <label className="block text-sm text-[#d8cbb9]" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="current-password"
              autoFocus
              className="w-full rounded-[8px] border border-white/12 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-heirloom"
              id="password"
              name="password"
              required
              type="password"
            />
            {params.error ? <p className="text-sm text-rose-300">Password did not match. Please try again.</p> : null}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-heirloom px-4 py-3 font-semibold text-[#16120f]" type="submit">
              <Sparkles size={18} /> Open operations
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
