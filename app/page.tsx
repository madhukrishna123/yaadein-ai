import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  Download,
  Heart,
  ImageUp,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { FakeWhatsAppDemo } from "@/components/FakeWhatsAppDemo";
import { Section } from "@/components/Section";
import { pricingPlans, whatsappLink } from "@/lib/yaadein-data";

const restorationFeatures = [
  "Scratch and dust cleanup",
  "Natural face sharpening",
  "Faded color recovery",
  "3 HD photos for INR 149"
];

const useCases = [
  {
    title: "Parents and grandparents",
    text: "Restore faded portraits, album photos, and old family moments without changing the person."
  },
  {
    title: "Wedding memories",
    text: "Repair blur, damage, low light, and aging so special ceremonies feel alive again."
  },
  {
    title: "Childhood albums",
    text: "Turn small, scratched, phone-captured prints into clean previews ready to share."
  }
];

const promiseCards = [
  {
    icon: ShieldCheck,
    title: "Identity stays real",
    text: "Faces are enhanced gently so the restored photo still feels like the person you remember."
  },
  {
    icon: Heart,
    title: "Preview before paying",
    text: "See watermarked previews first. Unlock HD only when the memories feel worth keeping."
  },
  {
    icon: RefreshCw,
    title: "Two careful retries",
    text: "If a restoration misses the mark, we retry up to two times per photo before support review."
  },
  {
    icon: Clock3,
    title: "Fast mobile flow",
    text: "Upload, preview, pay, download. The journey is built for mobile and WhatsApp sharing."
  }
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
            <a href="#restore">Restore</a>
            <a href="#pricing">Pricing</a>
            <a href="#promise">Promise</a>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full bg-heirloom px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#efcf83]"
            href={whatsappLink}
          >
            WhatsApp <ArrowRight size={16} />
          </a>
        </div>
      </nav>

      <section className="px-5 pb-14 pt-28 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.98fr_1fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-heirloom/30 bg-heirloom/10 px-4 py-2 text-sm text-heirloom">
              <Sparkles size={16} /> Restore Yaadein back to life
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-[#fff7ea] sm:text-6xl lg:text-7xl">
              Bring old photos back to life.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8cbb9]">
              Old photos fade. Memories don&apos;t have to. Restore the expressions that tell your family&apos;s story.
            </p>
            <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-[8px] border border-heirloom/25 bg-heirloom/10 px-4 py-3 text-sm text-[#f5e6c7]">
              <BadgeIndianRupee size={18} />
              Launch offer: <span className="font-semibold text-heirloom">3 HD restorations for INR 149</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink transition hover:bg-[#efcf83]"
                href="#restore"
              >
                <ImageUp size={19} /> Upload old photo
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/14 bg-white/[0.06] px-5 py-3 font-semibold text-[#fff7ea] transition hover:border-heirloom/50"
                href={whatsappLink}
              >
                <MessageCircle size={19} /> Start on WhatsApp
              </a>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3">
              {restorationFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.05] p-3">
                  <CheckCircle2 className="shrink-0 text-mintglass" size={17} />
                  <p className="text-sm leading-5 text-[#eadfce]">{feature}</p>
                </div>
              ))}
            </div>
          </div>
          <BeforeAfter />
        </div>
      </section>

      <Section eyebrow="Restore Now" id="restore" title="Upload a photo and get a free preview">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <FakeWhatsAppDemo />
          <div className="space-y-4" id="promise">
            {promiseCards.map((item) => (
              <div className="glass-panel rounded-[8px] p-5" key={item.title}>
                <item.icon className="mb-4 text-heirloom" size={22} />
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="leading-7 text-[#cdbfab]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="Memories We Restore" title="Made for photos people feel attached to">
        <div className="grid gap-4 md:grid-cols-3">
          {useCases.map((item) => (
            <div className="glass-panel rounded-[8px] p-6" key={item.title}>
              <Heart className="mb-5 text-roseglass" size={22} />
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-4 leading-7 text-[#cdbfab]">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Pricing" id="pricing" title="Launch pricing after the preview feels right">
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
        <div className="mt-5 grid gap-3 text-sm text-[#b9ac9a] md:grid-cols-2">
          <p className="flex items-center gap-2">
            <Download size={16} /> Free preview first. HD export unlocks after payment.
          </p>
          <p className="flex items-center gap-2">
            <RefreshCw size={16} /> Up to 2 AI retries per photo if the first result is not good enough.
          </p>
        </div>
      </Section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-[8px] border border-heirloom/25 bg-heirloom/10 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-heirloom">Yaadein AI</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-[#fff7ea] sm:text-4xl">
            Your memories deserve HD.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#d8cbb9]">
            Start with up to 3 photos. If the previews feel right, unlock the clean HD versions and share them with family.
          </p>
          <a
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-[8px] bg-heirloom px-5 py-3 font-semibold text-ink transition hover:bg-[#efcf83]"
            href="#restore"
          >
            Restore a memory <Sparkles size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
