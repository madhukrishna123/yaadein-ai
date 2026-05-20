import { query, hasDatabaseConfig } from "@/lib/db";
import {
  createRestorationJob as createMockRestorationJob,
  getMockJob,
  mockJobs,
  RestorationJob,
  updateMockJob
} from "@/lib/mock-store";

export type Customer = {
  id: string;
  whatsappPhone: string;
  name?: string;
  freePreviewCount: number;
  createdAt: string;
  lastSeenAt: string;
};

export type AdminSummary = {
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

type JobRow = {
  id: string;
  customer_id: string | null;
  whatsapp_phone?: string | null;
  status: RestorationJob["status"];
  source_image_url: string;
  source_image_path: string | null;
  restored_preview_url: string | null;
  restored_preview_path: string | null;
  watermarked_preview_url: string | null;
  watermarked_preview_path: string | null;
  restored_hd_url: string | null;
  restored_hd_path: string | null;
  share_page_slug: string;
  price_inr: number;
  preview_cost_usd: string | null;
  hd_cost_usd: string | null;
  processing_mode: RestorationJob["processingMode"] | null;
  failure_reason: string | null;
  created_at: Date;
  updated_at: Date;
};

type CustomerRow = {
  id: string;
  whatsapp_phone: string;
  name: string | null;
  free_preview_count: number;
  created_at: Date;
  last_seen_at: Date;
};

export async function findOrCreateCustomer(whatsappPhone: string, name?: string) {
  if (!hasDatabaseConfig()) {
    return {
      id: whatsappPhone,
      whatsappPhone,
      name,
      freePreviewCount: 0,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };
  }

  const result = await query<CustomerRow>(
    `
      insert into customers (whatsapp_phone, name, last_seen_at)
      values ($1, $2, now())
      on conflict (whatsapp_phone)
      do update set
        name = coalesce(excluded.name, customers.name),
        last_seen_at = now()
      returning *
    `,
    [whatsappPhone, name ?? null]
  );

  return mapCustomer(result.rows[0]);
}

export async function createJob(input: {
  id: string;
  customerPhone: string;
  sourceImageUrl: string;
  sourceImagePath?: string;
  priceInr?: number;
}) {
  if (!hasDatabaseConfig()) {
    return createMockRestorationJob({
      id: input.id,
      customerPhone: input.customerPhone,
      sourceImageUrl: input.sourceImageUrl,
      sourceImagePath: input.sourceImagePath
    });
  }

  const customer = await findOrCreateCustomer(input.customerPhone);
  const result = await query<JobRow>(
    `
      insert into restoration_jobs (
        id,
        customer_id,
        status,
        source_image_url,
        source_image_path,
        share_page_slug,
        price_inr
      )
      values ($1, $2, 'photo_received', $3, $4, $5, $6)
      returning *
    `,
    [
      input.id,
      customer.id,
      input.sourceImageUrl,
      input.sourceImagePath ?? null,
      input.id.toLowerCase(),
      input.priceInr ?? Number(process.env.PRICE_SINGLE_RESTORE_INR ?? 199)
    ]
  );

  return mapJob(result.rows[0], input.customerPhone);
}

export async function getJob(jobId: string) {
  if (!hasDatabaseConfig()) return getMockJob(jobId);

  const result = await query<JobRow>(
    `
      select restoration_jobs.*, customers.whatsapp_phone
      from restoration_jobs
      left join customers on customers.id = restoration_jobs.customer_id
      where lower(restoration_jobs.id) = lower($1)
      limit 1
    `,
    [jobId]
  );

  return result.rows[0] ? mapJob(result.rows[0]) : undefined;
}

export async function updateJob(jobId: string, patch: Partial<RestorationJob>) {
  if (!hasDatabaseConfig()) return updateMockJob(jobId, patch);

  const fields: string[] = [];
  const values: unknown[] = [];
  const fieldMap: Array<[keyof RestorationJob, string]> = [
    ["status", "status"],
    ["sourceImageUrl", "source_image_url"],
    ["sourceImagePath", "source_image_path"],
    ["restoredPreviewUrl", "restored_preview_url"],
    ["restoredPreviewPath", "restored_preview_path"],
    ["watermarkedPreviewUrl", "watermarked_preview_url"],
    ["watermarkedPreviewPath", "watermarked_preview_path"],
    ["restoredHdUrl", "restored_hd_url"],
    ["restoredHdPath", "restored_hd_path"],
    ["priceInr", "price_inr"],
    ["processingMode", "processing_mode"],
    ["failureReason", "failure_reason"]
  ];

  for (const [key, column] of fieldMap) {
    if (key in patch) {
      values.push(patch[key]);
      fields.push(`${column} = $${values.length}`);
    }
  }

  if (fields.length === 0) return getJob(jobId);

  values.push(jobId);
  const result = await query<JobRow>(
    `
      update restoration_jobs
      set ${fields.join(", ")}, updated_at = now()
      where lower(id) = lower($${values.length})
      returning *
    `,
    values
  );

  return result.rows[0] ? getJob(result.rows[0].id) : undefined;
}

export async function incrementFreePreviewCount(customerPhone: string) {
  if (!hasDatabaseConfig()) return;

  await query(
    `
      update customers
      set free_preview_count = free_preview_count + 1,
          last_seen_at = now()
      where whatsapp_phone = $1
    `,
    [customerPhone]
  );
}

export async function getCustomerByPhone(customerPhone: string) {
  if (!hasDatabaseConfig()) return undefined;

  const result = await query<CustomerRow>("select * from customers where whatsapp_phone = $1 limit 1", [customerPhone]);
  return result.rows[0] ? mapCustomer(result.rows[0]) : undefined;
}

export async function getAdminJobs() {
  if (!hasDatabaseConfig()) {
    return {
      jobs: mockJobs,
      summary: summarizeJobs(mockJobs, "memory")
    };
  }

  const jobsResult = await query<JobRow>(
    `
      select restoration_jobs.*, customers.whatsapp_phone
      from restoration_jobs
      left join customers on customers.id = restoration_jobs.customer_id
      order by restoration_jobs.created_at desc
      limit 50
    `
  );

  const jobs = jobsResult.rows.map((row) => mapJob(row));
  return {
    jobs,
    summary: summarizeJobs(jobs, "database")
  };
}

function summarizeJobs(jobs: RestorationJob[], storageMode: "database" | "memory"): AdminSummary {
  const paid = jobs.filter((job) => ["paid", "hd_ready", "delivered"].includes(job.status)).length;
  const totalJobs = jobs.length;

  return {
    totalJobs,
    previewReady: jobs.filter((job) => job.status === "preview_ready").length,
    paid,
    failed: jobs.filter((job) => job.status === "failed").length,
    manualReview: jobs.filter((job) => job.status === "manual_review").length,
    revenueInr: paid * 199,
    previewCostUsd: sumCost(jobs, "previewCostUsd"),
    hdCostUsd: sumCost(jobs, "hdCostUsd"),
    conversionRate: totalJobs > 0 ? Math.round((paid / totalJobs) * 100) : 0,
    averagePreviewSeconds: null,
    storageMode
  };
}

function sumCost(jobs: RestorationJob[], key: "previewCostUsd" | "hdCostUsd") {
  return Number(jobs.reduce((total, job) => total + Number(job[key] ?? 0), 0).toFixed(4));
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    whatsappPhone: row.whatsapp_phone,
    name: row.name ?? undefined,
    freePreviewCount: row.free_preview_count,
    createdAt: row.created_at.toISOString(),
    lastSeenAt: row.last_seen_at.toISOString()
  };
}

function mapJob(row: JobRow, fallbackPhone?: string): RestorationJob {
  return {
    id: row.id,
    customerPhone: row.whatsapp_phone ?? fallbackPhone ?? "unknown",
    status: row.status,
    sourceImageUrl: row.source_image_url,
    sourceImagePath: row.source_image_path ?? undefined,
    restoredPreviewUrl: row.restored_preview_url ?? undefined,
    restoredPreviewPath: row.restored_preview_path ?? undefined,
    watermarkedPreviewUrl: row.watermarked_preview_url ?? undefined,
    watermarkedPreviewPath: row.watermarked_preview_path ?? undefined,
    restoredHdUrl: row.restored_hd_url ?? undefined,
    restoredHdPath: row.restored_hd_path ?? undefined,
    sharePageSlug: row.share_page_slug,
    priceInr: row.price_inr,
    previewCostUsd: row.preview_cost_usd ? Number(row.preview_cost_usd) : undefined,
    hdCostUsd: row.hd_cost_usd ? Number(row.hd_cost_usd) : undefined,
    processingMode: row.processing_mode ?? undefined,
    failureReason: row.failure_reason ?? undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}
