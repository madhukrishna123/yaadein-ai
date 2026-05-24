import { createAdminLogoutResponse, requestOrigin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  return createAdminLogoutResponse(requestOrigin(request));
}
