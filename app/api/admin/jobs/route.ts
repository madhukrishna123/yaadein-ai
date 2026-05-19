import { NextResponse } from "next/server";
import { getAdminJobs } from "@/lib/job-repository";

export async function GET() {
  const data = await getAdminJobs();
  return NextResponse.json(data);
}
