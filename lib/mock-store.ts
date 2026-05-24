export type JobStatus =
  | "photo_received"
  | "restoring"
  | "preview_ready"
  | "awaiting_payment"
  | "paid"
  | "hd_ready"
  | "delivered"
  | "failed"
  | "manual_review";

export type RestorationJob = {
  id: string;
  customerPhone: string;
  status: JobStatus;
  sourceImageUrl: string;
  sourceImagePath?: string;
  restoredPreviewPath?: string;
  restoredPreviewUrl?: string;
  watermarkedPreviewPath?: string;
  watermarkedPreviewUrl?: string;
  restoredHdPath?: string;
  restoredHdUrl?: string;
  sharePageSlug: string;
  priceInr: number;
  previewCostUsd?: number;
  hdCostUsd?: number;
  processingMode?: "mock" | "local" | "openai" | "future-self-hosted";
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  jobId: string;
  amountInr: number;
  status: "created" | "paid" | "failed" | "cancelled" | "expired";
  razorpayPaymentLinkId?: string;
  razorpayPaymentLinkUrl?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
};

const now = new Date().toISOString();

export const mockPayments: PaymentRecord[] = [];

export const mockJobs: RestorationJob[] = [
  {
    id: "YA-1042",
    customerPhone: "+919876543210",
    status: "preview_ready",
    sourceImageUrl: "mock://old-family-photo.jpg",
    watermarkedPreviewUrl: "mock://preview-watermarked.jpg",
    sharePageSlug: "ya-1042-grandparents",
    priceInr: 149,
    createdAt: now,
    updatedAt: now
  }
];

export function createMockJob(customerPhone = "+919999999999", sourceImageUrl = "mock://uploaded-photo.jpg") {
  const id = createJobId();
  const job: RestorationJob = {
    id,
    customerPhone,
    status: "photo_received",
    sourceImageUrl,
    sharePageSlug: id.toLowerCase(),
    priceInr: 149,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockJobs.unshift(job);
  return job;
}

export function createRestorationJob(input: {
  id?: string;
  customerPhone?: string;
  sourceImageUrl: string;
  sourceImagePath?: string;
}) {
  const job = createMockJob(input.customerPhone, input.sourceImageUrl);
  if (input.id) {
    job.id = input.id;
    job.sharePageSlug = input.id.toLowerCase();
  }
  job.sourceImagePath = input.sourceImagePath;
  return job;
}

export function createJobId() {
  return `YA-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getMockJob(jobId: string) {
  return mockJobs.find((job) => job.id.toLowerCase() === jobId.toLowerCase());
}

export function updateMockJob(jobId: string, patch: Partial<RestorationJob>) {
  const job = getMockJob(jobId);
  if (!job) return undefined;
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  return job;
}
