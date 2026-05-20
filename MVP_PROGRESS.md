# Yaadein AI MVP Progress

## Built

- Next.js app foundation with TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.
- Premium dark landing page with WhatsApp-first CTA.
- Offline-safe before/after restoration preview component.
- Fake WhatsApp simulator for local product testing.
- Preview page for watermarked free result and INR 149 HD unlock.
- Customer dashboard mock.
- Admin dashboard mock with first 10 operating metrics.
- Mock API routes for WhatsApp start/upload, job lookup, mock restore, mock payment, admin jobs, and retry.
- Webhook placeholders for WhatsApp verification/messages and Razorpay payment events.
- Yaadein AI Codex skill for future company context.
- OpenAI restoration service in mock-safe mode.
- Server-side watermark generation.
- Server-side HD export normalization.
- Real upload API for JPG, PNG, and WEBP files under 50MB.
- Preview restoration and HD export API routes.

## Verified

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Local browser check passes for `/`, `/admin`, and `/preview/ya-1042-grandparents`.
- Mock API check passes for `/api/mock-whatsapp/start` and `/api/admin/jobs`.
- Upload-to-preview-to-HD smoke test passes in mock mode:
  - `POST /api/restoration/upload`
  - `POST /api/jobs/:jobId/restore`
  - `POST /api/jobs/:jobId/export-hd`
- Server move scripts and docs added:
  - `npm run verify`
  - `npm run env:check`
  - `npm run server:check`
  - `docs/SERVER_MOVE.md`
  - `docs/BUSINESS_MODEL_AND_DATABASE.md`
- Local Postgres database connected:
  - `npm run db:start`
  - `npm run db:schema`
  - `npm run db:check`
  - Admin API reports `storageMode: database`
  - Upload-only test job persisted to Postgres

## Local URL

- App: `http://127.0.0.1:3000`
- Admin: `http://127.0.0.1:3000/admin`
- Preview demo: `http://127.0.0.1:3000/preview/ya-1042-grandparents`

## Next Required Inputs

- Real WhatsApp Business phone number.
- Razorpay account details.
- Storage choice: Cloudflare R2 or AWS S3.
- Domain name.
- Approval for final v1 price tests.

## Next Build Steps

1. Replace local `public/uploads` storage with Cloudflare R2 or AWS S3.
2. Add Razorpay payment link and webhook verification.
3. Connect WhatsApp Business Cloud API.
4. Add production Supabase/Postgres connection.
5. Add production deployment environment.
