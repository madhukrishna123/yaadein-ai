import { NextResponse } from "next/server";
import { createAdminLoginResponse, hasAdminPassword, isSafeAdminNextPath, requestOrigin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const requestedNextPath = String(formData.get("next") ?? "/admin");
  const nextPath = isSafeAdminNextPath(requestedNextPath) ? requestedNextPath : "/admin";

  if (!hasAdminPassword()) {
    return NextResponse.redirect(new URL("/admin/login?setup=1", requestOrigin(request)));
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`, requestOrigin(request)));
  }

  return createAdminLoginResponse(nextPath, requestOrigin(request));
}
