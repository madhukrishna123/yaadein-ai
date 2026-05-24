import { hasDatabaseConfig, query } from "@/lib/db";
import { mockPayments, PaymentRecord } from "@/lib/mock-store";

type PaymentRow = {
  id: string;
  job_id: string;
  amount_inr: number;
  status: PaymentRecord["status"];
  razorpay_payment_link_id: string | null;
  razorpay_payment_link_url: string | null;
  razorpay_payment_id: string | null;
  paid_at: Date | null;
  created_at: Date;
};

export async function getPaymentForJob(jobId: string) {
  if (!hasDatabaseConfig()) {
    return mockPayments.find((payment) => payment.jobId.toLowerCase() === jobId.toLowerCase());
  }

  const result = await query<PaymentRow>(
    `
      select *
      from payments
      where lower(job_id) = lower($1)
      order by created_at desc
      limit 1
    `,
    [jobId]
  );

  return result.rows[0] ? mapPayment(result.rows[0]) : undefined;
}

export async function upsertPaymentLink(input: {
  jobId: string;
  amountInr: number;
  status: PaymentRecord["status"];
  razorpayPaymentLinkId: string;
  razorpayPaymentLinkUrl: string;
}) {
  if (!hasDatabaseConfig()) {
    const existing = await getPaymentForJob(input.jobId);
    if (existing) {
      Object.assign(existing, {
        amountInr: input.amountInr,
        status: input.status,
        razorpayPaymentLinkId: input.razorpayPaymentLinkId,
        razorpayPaymentLinkUrl: input.razorpayPaymentLinkUrl
      });
      return existing;
    }

    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      jobId: input.jobId,
      amountInr: input.amountInr,
      status: input.status,
      razorpayPaymentLinkId: input.razorpayPaymentLinkId,
      razorpayPaymentLinkUrl: input.razorpayPaymentLinkUrl,
      createdAt: new Date().toISOString()
    };
    mockPayments.unshift(payment);
    return payment;
  }

  const result = await query<PaymentRow>(
    `
      insert into payments (
        job_id,
        amount_inr,
        status,
        razorpay_payment_link_id,
        razorpay_payment_link_url
      )
      values ($1, $2, $3, $4, $5)
      on conflict (job_id)
      do update set
        amount_inr = excluded.amount_inr,
        status = excluded.status,
        razorpay_payment_link_id = excluded.razorpay_payment_link_id,
        razorpay_payment_link_url = excluded.razorpay_payment_link_url
      returning *
    `,
    [input.jobId, input.amountInr, input.status, input.razorpayPaymentLinkId, input.razorpayPaymentLinkUrl]
  );

  return mapPayment(result.rows[0]);
}

export async function markPaymentPaid(input: {
  jobId?: string;
  razorpayPaymentLinkId?: string;
  razorpayPaymentId?: string;
}) {
  if (!hasDatabaseConfig()) {
    const payment = mockPayments.find((record) => {
      if (input.jobId && record.jobId.toLowerCase() === input.jobId.toLowerCase()) return true;
      return Boolean(input.razorpayPaymentLinkId && record.razorpayPaymentLinkId === input.razorpayPaymentLinkId);
    });

    if (!payment) return undefined;
    payment.status = "paid";
    payment.razorpayPaymentId = input.razorpayPaymentId ?? payment.razorpayPaymentId;
    payment.paidAt = new Date().toISOString();
    return payment;
  }

  const filters: string[] = [];
  const values: unknown[] = [];

  if (input.jobId) {
    values.push(input.jobId);
    filters.push(`lower(job_id) = lower($${values.length})`);
  }

  if (input.razorpayPaymentLinkId) {
    values.push(input.razorpayPaymentLinkId);
    filters.push(`razorpay_payment_link_id = $${values.length}`);
  }

  if (filters.length === 0) return undefined;

  values.push(input.razorpayPaymentId ?? null);
  const paymentIdIndex = values.length;

  const result = await query<PaymentRow>(
    `
      update payments
      set
        status = 'paid',
        razorpay_payment_id = coalesce($${paymentIdIndex}, razorpay_payment_id),
        paid_at = coalesce(paid_at, now())
      where ${filters.join(" or ")}
      returning *
    `,
    values
  );

  return result.rows[0] ? mapPayment(result.rows[0]) : undefined;
}

export async function updatePaymentStatus(input: {
  razorpayPaymentLinkId: string;
  status: PaymentRecord["status"];
}) {
  if (!hasDatabaseConfig()) {
    const payment = mockPayments.find((record) => record.razorpayPaymentLinkId === input.razorpayPaymentLinkId);
    if (!payment) return undefined;
    payment.status = input.status;
    return payment;
  }

  const result = await query<PaymentRow>(
    `
      update payments
      set status = $1
      where razorpay_payment_link_id = $2
      returning *
    `,
    [input.status, input.razorpayPaymentLinkId]
  );

  return result.rows[0] ? mapPayment(result.rows[0]) : undefined;
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    amountInr: row.amount_inr,
    status: row.status,
    razorpayPaymentLinkId: row.razorpay_payment_link_id ?? undefined,
    razorpayPaymentLinkUrl: row.razorpay_payment_link_url ?? undefined,
    razorpayPaymentId: row.razorpay_payment_id ?? undefined,
    paidAt: row.paid_at?.toISOString(),
    createdAt: row.created_at.toISOString()
  };
}
