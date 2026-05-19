# Yaadein AI Server Move Guide

This guide keeps the move from local development to a hosted server clean and repeatable.

## Current Runtime

- Next.js app with Node.js runtime routes.
- Local file storage is currently `public/uploads`.
- Jobs are still in in-memory development storage.
- Real OpenAI restoration activates when `OPENAI_API_KEY` is present.

## Pre-Move Checklist

Run locally before any deployment:

```bash
npm install
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
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=

OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_PREVIEW_QUALITY=low
OPENAI_IMAGE_HD_QUALITY=high

DATABASE_URL=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

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
NEXT_PUBLIC_APP_URL=https://your-domain.com npm run server:check
```

6. Test one low-quality preview only.
7. Check OpenAI usage cost.
8. Only then enable marketing traffic.

## Production Blockers Before Real Users

- Run `db/schema.sql` and set `DATABASE_URL`.
- Replace local `public/uploads` with R2/S3.
- Add Razorpay payment unlock before HD export.
- Add one-free-preview-per-phone rule.
- Add WhatsApp Business Cloud API.

## Rollback

Keep the previous Vercel deployment available. If a new deploy has bad restoration, payment, or upload behavior, promote the previous deployment and investigate from logs.
