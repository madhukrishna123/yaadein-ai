import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getAdminJobs } from "@/lib/job-repository";

export async function GET(request: Request) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorizedAdminResponse();
  }

  const data = await getAdminJobs();
  return NextResponse.json(data);
}
