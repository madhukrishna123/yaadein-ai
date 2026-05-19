import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { FakeWhatsAppDemo } from "@/components/FakeWhatsAppDemo";
import { Section } from "@/components/Section";
import { agents, pricingPlans, whatsappLink } from "@/lib/yaadein-data";

const steps = [
  "Send your old photo on WhatsApp",
  "Get a free watermarked preview",
  "Pay only if you love it",
  "Receive the HD photo on WhatsApp"
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/70 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link className="text-lg font-semibold text-[#fff7ea]" href="/">
            Yaadein AI
          </Link>
          <div className="hidden items-center gap-6 text-sm text-[#cbbda9] sm:flex">
            <a href="#demo">Demo</a>
            <a href="#pricing">Pricing</a>
            <a href="/admin">Admin</a>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full bg-heirloom px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#efcf83]"
            href={whatsappLink}
          >
            WhatsApp <ArrowRight size={16} />
          </a>
        </div>
      </nav>

      <section className="px-5 pb-12 pt-28 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-heirloom/30 bg-heirloom/10 px-4 py-2 text-sm text-heirloom">
              <Sparkles size={16} /> WhatsApp-first AI photo restoration
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-[#fff7ea] sm:text-6xl lg:text-7xl">
              Restore memories lost in time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8cbb9]">
              Send an old family photo on WhatsApp. Yaadein AI restores it into a clean HD memory
              while preserving the real face, clothes, texture, and feeling of the original.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink transition hover:bg-[#efcf83]"
                href={whatsappLink}
              >
                <MessageCircle size={19} /> Restore on WhatsApp
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/14 bg-white/[0.06] px-5 py-3 font-semibold text-[#fff7ea] transition hover:border-heirloom/50"
                href="#demo"
              >
                See before and after
              </a>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-3">
                  <p className="mb-2 text-xs font-semibold text-heirloom">0{index + 1}</p>
                  <p className="text-sm leading-5 text-[#eadfce]">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <BeforeAfter />
        </div>
      </section>

      <Section eyebrow="Live flow" id="demo" title="The app feels like a calm WhatsApp studio">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1fr] lg:items-start">
          <FakeWhatsAppDemo />
          <div className="space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: "Identity preserved",
                text: "The restoration prompt protects facial structure, age, expression, clothing, and historical feel."
              },
              {
                icon: Bot,
                title: "Automation-ready",
                text: "The fake WhatsApp flow maps directly to real WhatsApp webhooks when the business number is ready."
              },
              {
                icon: BadgeIndianRupee,
                title: "Pay after preview",
                text: "The user sees a watermarked result first and pays INR 149 only when they want the HD export."
              },
              {
                icon: Clock3,
                title: "Built for speed",
                text: "The job lifecycle is designed around fast previews, clear states, and admin visibility."
              }
            ].map((item) => (
              <div className="glass-panel rounded-[8px] p-5" key={item.title}>
                <item.icon className="mb-4 text-heirloom" size={22} />
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="leading-7 text-[#cdbfab]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="Packages" id="pricing" title="Simple pricing for emotional decisions">
        <div className="grid gap-4 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div className="glass-panel rounded-[8px] p-6" key={plan.name}>
              <p className="text-sm text-heirloom">{plan.name}</p>
              <h3 className="mt-3 text-3xl font-semibold">{plan.price}</h3>
              <p className="mt-4 min-h-24 leading-7 text-[#cdbfab]">{plan.description}</p>
              <a
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-heirloom/40 bg-heirloom/12 px-4 py-3 font-semibold text-heirloom transition hover:bg-heirloom hover:text-ink"
                href={whatsappLink}
              >
                Start restore <ArrowRight size={17} />
              </a>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-[#b9ac9a]">
          Preview is free. Pay only when you want the HD version without watermark.
        </p>
      </Section>

      <Section eyebrow="Company agents" title="Yaadein AI works like a small online company">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5" key={agent.name}>
              <CheckCircle2 className="mb-4 text-mintglass" size={20} />
              <p className="text-lg font-semibold">{agent.name}</p>
              <p className="mt-1 text-sm text-heirloom">{agent.owner}</p>
              <p className="mt-4 leading-7 text-[#cdbfab]">{agent.description}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
