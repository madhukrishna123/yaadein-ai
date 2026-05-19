# Yaadein AI Project Plan

## Brand

Yaadein AI is a WhatsApp-first AI memory restoration company.

- Tagline: Restore memories lost in time.
- Promise: Send an old photo on WhatsApp and receive a restored HD memory.
- Feel: emotional, premium, simple, trustworthy, India-first.
- CTA: Restore on WhatsApp.

## Core Customer Flow

1. User discovers Yaadein AI through an ad, reel, referral, QR code, or website.
2. User taps a WhatsApp link and sends an old photo to the Yaadein AI business number.
3. Yaadein AI sends emotional progress updates.
4. AI creates a free watermarked preview.
5. User pays to unlock HD.
6. Yaadein AI delivers the final HD image and share link on WhatsApp.

No native app is required for v1. WhatsApp is the app.

## MVP Scope

Build first:

- WhatsApp photo intake.
- AI restoration using OpenAI image models.
- Watermarked preview.
- Pay-per-photo HD unlock.
- Razorpay payment.
- HD delivery on WhatsApp.
- Before/after preview page.
- Basic admin dashboard.

Build later:

- Batch processing.
- Credits and subscriptions.
- Wedding and family archive packages.
- Human quality review.
- Native mobile app.

## Default Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Framer Motion.
- Backend: Next.js API routes or Node service.
- Database: Supabase/Postgres.
- Storage: Cloudflare R2 or AWS S3.
- Queue: Redis/BullMQ.
- AI: OpenAI image API.
- Payments: Razorpay.
- Messaging: WhatsApp Business Cloud API.
- Hosting: Vercel for web, Railway or Render for workers.

## Timeline

- Prototype: 2-4 days.
- Working web MVP: 1-2 weeks.
- WhatsApp plus payment MVP: 3-5 weeks.
- Production-ready v1: 5-7 weeks.
- Marketing tests: start around week 3.

## ROI Defaults

- Free watermarked preview.
- INR 149 HD restore.
- INR 399 for 3 photos.
- INR 999 family pack.
- Estimated OpenAI API cost per paid photo: INR 15-25.

The main business question is whether paid customer acquisition can stay below the margin per photo.
