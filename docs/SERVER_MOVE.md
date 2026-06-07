# Yaadein AI Server Move Guide

This guide keeps the move from local development to a hosted server clean and repeatable.

## Current Runtime

- Next.js app with Node.js runtime routes.
- R2 storage is used when R2 keys are configured, with local storage as fallback.
- Jobs use Postgres when `DATABASE_URL` is configured, with in-memory storage as local fallback.
- Admin operations are protected by an operator password cookie.
- Real OpenAI restoration activates when `OPENAI_API_KEY` is present.

## Pre-Move Checklist

Run locally before any deployment:

```bash
npm install
npm run db:check
npm run verify
npm run env:check
```

`env:check` is expected to fail until production services are configured.

## Recommended Hosting

Use Vercel for the web app first.

Use a separate worker host later only when background queues are added.

## Production Environment Variables

Set these in the hosting dashboard:

```env
NEXT_PUBLIC_APP_URL=https://yaadein-ai.nestrift.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919885711673
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_PREVIEW_QUALITY=low
OPENAI_IMAGE_HD_QUALITY=high
OPENAI_PREVIEW_INPUT_FIDELITY=high
OPENAI_HD_INPUT_FIDELITY=high
RESTORATION_PREVIEW_PROVIDER=openai
RESTORATION_HD_PROVIDER=openai

DATABASE_URL=

R2_ACCOUNT_ID=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
INTERNAL_JOB_SECRET=

WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

MOCK_RESTORATION_ENABLED=false
```

Do not commit `.env.local`.

## Deployment Steps

1. Push latest `main` to GitHub.
2. Import `madhukrishna123/yaadein-ai` into Vercel.
3. Add production environment variables.
4. Deploy.
5. Run smoke checks:

```bash
NEXT_PUBLIC_APP_URL=https://yaadein-ai.nestrift.com npm run server:check
```

6. Test one low-quality preview only.
7. Check OpenAI usage cost.
8. Open `/admin/login` and confirm the admin page requires the password.
9. Create one Razorpay test payment link from a preview page.
10. Add the production webhook URL in Razorpay once the domain is live.
11. Add the WhatsApp webhook URL in Meta:

```text
https://your-domain.com/api/webhooks/whatsapp
```

12. Run the WhatsApp job processor every minute:

```bash
curl -H "Authorization: Bearer $INTERNAL_JOB_SECRET" https://your-domain.com/api/internal/process-jobs
```

13. Test one WhatsApp flow end to end: send photo, receive preview, pay by UPI, receive HD photo.
14. Only then enable marketing traffic.

## Production Blockers Before Real Users

- Run `db/schema.sql` and set `DATABASE_URL`.
- Add Razorpay payment unlock before HD export.
- Add one-free-preview-per-phone rule.
- Add WhatsApp Business Cloud API.
- Add a minute-based trigger for `/api/internal/process-jobs`.
- Set a strong `ADMIN_PASSWORD` and unique `ADMIN_SESSION_SECRET`.

## WhatsApp UPI-First Flow

The launch flow is designed for non-technical customers:

1. Customer sends an old photo to the Yaadein WhatsApp number.
2. Yaadein replies that the photo was received and gives a restoration ID.
3. The job processor creates the free watermarked preview.
4. Yaadein sends the preview on WhatsApp.
5. The caption asks the customer to pay by UPI through the Razorpay link.
6. Razorpay webhook marks the job as paid.
7. The job processor generates the HD photo and sends it back on WhatsApp.

Payment copy should stay simple: UPI first, PhonePe/Google Pay/Paytm/BHIM examples, and no technical words.

## Local Postgres Setup

For local database mode:

```bash
npm run db:start
```

Add the printed `DATABASE_URL` to `.env.local`, then run:

```bash
npm run db:schema
npm run db:check
```

Restart the dev server. The admin page should show:

```text
Admin data source: database
```

## Rollback

Keep the previous Vercel deployment available. If a new deploy has bad restoration, payment, or upload behavior, promote the previous deployment and investigate from logs.
