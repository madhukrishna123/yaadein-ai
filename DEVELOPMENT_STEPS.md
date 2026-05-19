# Yaadein AI Development Steps

## Step 1: Clean Project Foundation

- Create the Next.js app.
- Add TypeScript, Tailwind CSS, linting, formatting, and environment variable structure.
- Create basic routes for landing, preview, checkout callback, dashboard, and admin.

## Step 2: Product Prototype

- Build landing page with Restore on WhatsApp CTA.
- Build upload simulator for local testing.
- Build before/after preview page.
- Build pricing section.
- Build admin mock with fake restoration jobs.

## Step 3: AI Restoration Engine

- Added image upload and local development storage.
- Added restoration job model in mock store.
- Added mock-safe OpenAI image restoration service.
- Added server-side watermarked preview generation.
- Added HD export generation after unlock.

Production follow-up:

- Move local storage to Cloudflare R2 or AWS S3.
- Move in-memory jobs to Postgres.
- Run real OpenAI smoke test after `OPENAI_API_KEY` is available.

## Step 4: Payment Flow

- Add Razorpay payment link creation.
- Add payment webhook.
- Mark restoration as paid.
- Trigger HD export and delivery.

## Step 5: WhatsApp Automation

- Connect WhatsApp Business Cloud API.
- Add WhatsApp webhook for incoming photos.
- Send greeting, progress updates, preview, payment link, and final image.

## Step 6: Admin And Analytics

- Show jobs, users, payments, failures, and queue state.
- Add retry controls for failed jobs.
- Track chat starts, uploads, previews, payments, and referrals.

## Step 7: Production Deployment

- Deploy web app.
- Deploy worker if needed.
- Configure domain.
- Add production environment variables.
- Add logging, monitoring, privacy policy, and terms.

## Step 8: Marketing Launch

- Start with Instagram Reels, WhatsApp sharing, local photo studios, wedding photographers, and family archive offers.
- Test INR 149 single restore, INR 399 three-photo pack, and INR 999 family pack.
- Measure paid conversion and customer acquisition cost.
