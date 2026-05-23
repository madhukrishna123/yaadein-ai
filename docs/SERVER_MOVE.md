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
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_PREVIEW_QUALITY=low
OPENAI_IMAGE_HD_QUALITY=high
OPENAI_PREVIEW_INPUT_FIDELITY=low
OPENAI_HD_INPUT_FIDELITY=high
RESTORATION_PREVIEW_PROVIDER=local
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
8. Open `/admin/login` and confirm the admin page requires the password.
9. Only then enable marketing traffic.

## Production Blockers Before Real Users

- Run `db/schema.sql` and set `DATABASE_URL`.
- Add Razorpay payment unlock before HD export.
- Add one-free-preview-per-phone rule.
- Add WhatsApp Business Cloud API.
- Set a strong `ADMIN_PASSWORD` and unique `ADMIN_SESSION_SECRET`.

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
