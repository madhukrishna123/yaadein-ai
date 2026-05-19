# Yaadein AI Business Model And Database Plan

## Cost Problem

The first real image test cost about `$0.11`, around INR 9-10. That can work for paid HD exports, but unlimited free previews can damage margins.

## Updated V1 Business Model

- One free AI preview per WhatsApp phone number.
- Preview uses low-cost settings.
- HD export uses high-quality settings only after payment.
- Single HD restore test price: INR 199.
- Three-photo pack: INR 499.
- Family pack: INR 1299.

Fallback if preview costs remain high:

- INR 29 preview deposit.
- Balance payment for HD export.

## AI Cost Controls

Preview:

```env
OPENAI_IMAGE_PREVIEW_QUALITY=low
```

HD:

```env
OPENAI_IMAGE_HD_QUALITY=high
```

Implementation rule:

- Preview uses low/cheaper fidelity.
- HD uses high fidelity after payment.
- Track estimated cost per job.
- Stop repeated free previews per phone number.

## Database Tables

### customers

- `id`
- `whatsapp_phone`
- `name`
- `free_preview_count`
- `created_at`
- `last_seen_at`

### restoration_jobs

- `id`
- `customer_id`
- `status`
- `source_image_url`
- `source_image_path`
- `restored_preview_url`
- `watermarked_preview_url`
- `restored_hd_url`
- `price_inr`
- `preview_cost_usd`
- `hd_cost_usd`
- `processing_mode`
- `failure_reason`
- `share_page_slug`
- `created_at`
- `updated_at`

### payments

- `id`
- `job_id`
- `amount_inr`
- `status`
- `razorpay_payment_link_id`
- `razorpay_payment_id`
- `paid_at`
- `created_at`

### messages

- `id`
- `customer_id`
- `job_id`
- `direction`
- `channel`
- `message_type`
- `body`
- `media_url`
- `provider_message_id`
- `created_at`

### events

- `id`
- `customer_id`
- `job_id`
- `type`
- `metadata_json`
- `created_at`

## Build Order

1. Add Postgres/Supabase database client.
2. Create database schema.
3. Replace in-memory `mock-store` with repository functions.
4. Enforce one free preview per phone number.
5. Track preview and HD cost fields.
6. Update admin dashboard with ROI metrics.
7. Add Razorpay payment gating before HD export.
8. Move image files to R2/S3.

## Schema Setup

Run the SQL in `db/schema.sql` against Supabase/Postgres before setting `DATABASE_URL`.

Local app behavior:

- Without `DATABASE_URL`, admin uses in-memory development data.
- With `DATABASE_URL`, uploads, jobs, statuses, costs, and admin metrics use Postgres.

Production rule:

- Set `FREE_PREVIEW_LIMIT_PER_PHONE=1`.
- Set `PRICE_SINGLE_RESTORE_INR=199`.
- Keep `OPENAI_IMAGE_PREVIEW_QUALITY=low`.
