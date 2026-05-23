import { createAdminLogoutResponse } from "@/lib/admin-auth";

export async function POST(request: Request) {
  return createAdminLogoutResponse(request.url);
}
