import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  Users,
  BarChart3,
  Share2,
  CalendarHeart,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "50+ Stunning Templates",
    description:
      "Choose from Royal, Floral, Minimal, and Modern designs — Hindu, Muslim, Christian, Sikh, and inter-faith styles.",
  },
  {
    icon: Users,
    title: "Smart Guest Management",
    description:
      "Organise hundreds of guests with groups, family tags, and per-function invite lists.",
  },
  {
    icon: CheckCircle2,
    title: "Real-time RSVP Tracking",
    description:
      "Know who's coming the moment they respond — live counts, dietary preferences, and attendance notes.",
  },
  {
    icon: Share2,
    title: "WhatsApp-First Sharing",
    description:
      "Share personalised invitations via WhatsApp, Email, Instagram, or a simple link with one tap.",
  },
  {
    icon: CalendarHeart,
    title: "Multi-Function Events",
    description:
      "Manage Mehndi, Haldi, Sangeet, Wedding, and Reception — each with its own venue, time, and dress code.",
  },
  {
    icon: BarChart3,
    title: "Attendance Analytics",
    description:
      "Get headcounts per function, dietary breakdowns, and exportable reports for your venue and caterer.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Event",
    description:
      "Add your wedding details and all functions — it takes less than 5 minutes.",
  },
  {
    step: "02",
    title: "Design & Personalise",
    description:
      "Pick a template, add your couple photo, customise colours and text.",
  },
  {
    step: "03",
    title: "Share & Track",
    description:
      "Send via WhatsApp or email, then watch RSVPs roll in live on your dashboard.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlight: false,
    features: [
      "1 wedding event",
      "Up to 50 guests",
      "5 free templates",
      "RSVP collection",
      "WhatsApp share link",
      "Basic analytics",
    ],
    cta: "Get started free",
    href: "/register",
  },
  {
    name: "Premium",
    price: "₹999",
    period: "per event",
    highlight: true,
    features: [
      "Unlimited events",
      "Up to 1,000 guests",
      "50+ premium templates",
      "Email sending (500/event)",
      "Automated RSVP reminders",
      "Background music & video",
      "Full analytics & export",
      "Priority support",
    ],
    cta: "Start with Premium",
    href: "/register?plan=premium",
  },
];

const stats = [
  { value: "10K+", label: "Invitations Created" },
  { value: "500K+", label: "RSVPs Collected" },
  { value: "50+", label: "Beautiful Templates" },
  { value: "99%", label: "Guest Satisfaction" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white px-4 pb-24 pt-20 text-center sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-pink-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 bg-rose-100 text-rose-700 hover:bg-rose-100"
          >
            <Sparkles className="h-3 w-3" />
            Digital Wedding Invitations — Free to Start
          </Badge>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Your Love Story,
            <br />
            <span className="text-rose-600">Beautifully Invited</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Create stunning digital wedding invitations, manage guests, and
            collect RSVPs — all in one place. Designed for Indian weddings.
            Share via WhatsApp in seconds.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-rose-600 px-8 text-base hover:bg-rose-700 sm:w-auto"
              )}
            >
              Create Free Invitation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#templates"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full border-slate-200 px-8 text-base sm:w-auto"
              )}
            >
              View Templates
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            No credit card required · Free forever plan available
          </p>
        </div>

        {/* Mock invitation card */}
        <div className="relative mx-auto mt-16 max-w-sm">
          <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-2xl shadow-rose-100">
            <div className="mb-6 text-center">
              <div className="mb-3 text-4xl">💍</div>
              <p className="text-xs font-medium uppercase tracking-widest text-rose-400">
                Together with their families
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Arjun &amp; Priya
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                request the pleasure of your company
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-rose-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <CalendarHeart className="h-4 w-4 flex-shrink-0 text-rose-500" />
                <div>
                  <p className="text-xs text-slate-500">Wedding Ceremony</p>
                  <p className="text-sm font-medium text-slate-800">
                    Saturday, 15 Feb 2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 flex-shrink-0 text-rose-500" />
                <div>
                  <p className="text-xs text-slate-500">Venue</p>
                  <p className="text-sm font-medium text-slate-800">
                    The Grand Ballroom, Mumbai
                  </p>
                </div>
              </div>
            </div>
            <Button className="mt-5 w-full bg-rose-600 hover:bg-rose-700">
              RSVP Now
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold text-rose-600">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-rose-100 text-rose-700 hover:bg-rose-100"
            >
              Everything you need
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900">
              Built for Indian Weddings
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Every feature crafted for how Indian families celebrate — across
              multiple functions, hundreds of guests, and WhatsApp-first
              communication.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-rose-100 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 transition-colors group-hover:bg-rose-100">
                  <Icon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-rose-100 text-rose-700 hover:bg-rose-100"
            >
              Simple &amp; fast
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ step, title, description }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-2xl font-bold text-white shadow-lg shadow-rose-200">
                  {step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────────── */}
      <section id="templates" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-rose-100 text-rose-700 hover:bg-rose-100"
            >
              50+ designs
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900">
              A design for every wedding
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Royal, Floral, Minimal, Modern — Hindu, Muslim, Christian, Sikh,
              and inter-faith.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { label: "Royal Elegance", tag: "Hindu · Traditional", color: "from-amber-100 to-orange-50" },
              { label: "Modern Minimal", tag: "Universal · Contemporary", color: "from-rose-100 to-pink-50" },
              { label: "Floral Garden", tag: "Christian · Romantic", color: "from-emerald-100 to-teal-50" },
            ].map(({ label, tag, color }) => (
              <div
                key={label}
                className={`flex h-64 flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${color} p-6 text-center shadow-sm`}
              >
                <div className="mb-3 text-4xl">💐</div>
                <p className="font-semibold text-slate-800">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{tag}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-rose-200 text-rose-600 hover:bg-rose-50"
              )}
            >
              Browse all templates →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-rose-100 text-rose-700 hover:bg-rose-100"
            >
              Simple pricing
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900">
              Start free, upgrade when ready
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {plans.map(({ name, price, period, highlight, features: planFeatures, cta, href }) => (
              <div
                key={name}
                className={`rounded-3xl border p-8 ${
                  highlight
                    ? "border-rose-200 bg-white shadow-xl ring-1 ring-rose-200"
                    : "border-slate-200 bg-white"
                }`}
              >
                {highlight && (
                  <Badge className="mb-4 bg-rose-600 text-white hover:bg-rose-600">
                    Most Popular
                  </Badge>
                )}
                <p className="text-lg font-semibold text-slate-900">{name}</p>
                <p className="mt-2">
                  <span className="text-4xl font-bold text-slate-900">{price}</span>
                  <span className="ml-1 text-slate-500">/{period}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={cn(
                    buttonVariants({ variant: highlight ? "default" : "outline" }),
                    "mt-8 w-full",
                    highlight
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="bg-rose-600 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-5xl">💍</p>
          <h2 className="text-4xl font-bold text-white">
            Ready to invite your people?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-rose-100">
            Join thousands of couples who created their dream digital wedding
            invitation with MarriageVerse.
          </p>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-10 bg-white px-10 text-rose-600 hover:bg-rose-50"
            )}
          >
            Create Your Invitation Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-xl">💍</span>
            <span>
              <span className="text-rose-600">Marriage</span>
              <span className="text-slate-800">Verse</span>
            </span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} MarriageVerse. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-rose-600">Privacy</Link>
            <Link href="/terms" className="hover:text-rose-600">Terms</Link>
            <Link href="/contact" className="hover:text-rose-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
