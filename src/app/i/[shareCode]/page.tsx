"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Shirt,
  Share2,
  ExternalLink,
} from "lucide-react";
import { getEventByShareCode, getEventFunctions } from "@/lib/firebase/events";
import { getEventInvitation } from "@/lib/firebase/invitations";
import { getTemplate } from "@/lib/templates";
import { TemplateFullPreview } from "@/components/templates/TemplatePreviewRenderer";
import { SharePanel } from "@/components/sharing/SharePanel";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { WeddingEvent, EventFunction, Invitation, InvitationTemplate } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildInvitationUrl(code: string): string {
  if (typeof window === "undefined") return `/i/${code}`;
  return `${window.location.origin}/i/${code}`;
}

// ─── Ceremony card ───────────────────────────────────────────────────────────

function CeremonyCard({ fn }: { fn: EventFunction }) {
  const displayName =
    fn.name === "Custom" && fn.customName ? fn.customName : fn.name;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 text-base mb-3">{displayName}</h3>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span>{formatDate(fn.date)}</span>
        </div>
        {fn.startTime && (
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              {fn.startTime}
              {fn.endTime ? ` – ${fn.endTime}` : ""}
            </span>
          </div>
        )}
        {fn.venueName && (
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div>
              <p className="font-medium text-slate-800">{fn.venueName}</p>
              {fn.venueAddress && (
                <p className="text-xs text-slate-500">{fn.venueAddress}</p>
              )}
              {fn.venueCity && (
                <p className="text-xs text-slate-500">{fn.venueCity}</p>
              )}
              {fn.mapsURL && (
                <a
                  href={fn.mapsURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on map
                </a>
              )}
            </div>
          </div>
        )}
        {fn.dressCode && (
          <div className="flex items-center gap-2.5">
            <Shirt className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Dress code: {fn.dressCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PublicInvitationPage() {
  const { shareCode } = useParams<{ shareCode: string }>();

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [functions, setFunctions] = useState<EventFunction[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [template, setTemplate] = useState<InvitationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!shareCode) return;

    getEventByShareCode(shareCode)
      .then(async (ev) => {
        if (!ev) { setNotFound(true); return; }
        setEvent(ev);

        const [fns, inv] = await Promise.all([
          getEventFunctions(ev.eventId),
          getEventInvitation(ev.eventId),
        ]);
        setFunctions(fns);
        if (inv) {
          setInvitation(inv);
          const t = getTemplate(inv.templateId);
          setTemplate(t ?? null);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareCode]);

  if (loading) return <LoadingSpinner fullPage />;

  if (notFound || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
        <div className="max-w-sm text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <span className="text-2xl">💌</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Invitation not found</h1>
          <p className="text-sm text-slate-500">
            This link may be invalid or the invitation has been removed.
          </p>
        </div>
      </div>
    );
  }

  const invitationUrl = buildInvitationUrl(shareCode);
  const whatsappMessage = `💍 *${event.title}* are getting married!\n\nView their wedding invitation:\n${invitationUrl}\n\n📅 ${formatShortDate(event.weddingDate)} · 📍 ${event.city}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Hero header */}
      <div
        className="relative px-4 pb-10 pt-12 text-center text-white"
        style={{
          background:
            template?.bg ??
            "linear-gradient(160deg, #9f1239 0%, #be185d 50%, #9f1239 100%)",
        }}
      >
        <p
          className="mb-3 text-sm font-light tracking-[0.2em] uppercase opacity-80"
        >
          {invitation?.customTagline || "Wedding Invitation"}
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl"
          style={{ color: template?.accentColor ?? "#fff" }}
        >
          {event.brideName}
        </h1>
        <p className="my-1 text-lg opacity-70">&amp;</p>
        <h1 className="text-3xl font-bold sm:text-4xl"
          style={{ color: template?.accentColor ?? "#fff" }}
        >
          {event.groomName}
        </h1>
        <div className="mt-5 flex items-center justify-center gap-3 text-sm opacity-80">
          <span>{formatShortDate(event.weddingDate)}</span>
          <span>·</span>
          <span>{event.city}{event.state ? `, ${event.state}` : ""}</span>
        </div>

        {/* Share button */}
        <button
          type="button"
          onClick={() => setShowShare((v) => !v)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          <Share2 className="h-4 w-4" />
          Share this invitation
        </button>
      </div>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        {/* Share panel — shown when toggled */}
        {showShare && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-rose-500" />
              Share Invitation
            </h2>
            <SharePanel url={invitationUrl} whatsappMessage={whatsappMessage} />
          </div>
        )}

        {/* Invitation preview */}
        {template && (
          <div>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
              Invitation Card
            </p>
            <div className="flex justify-center">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <TemplateFullPreview
                  template={template}
                  event={event}
                  functions={functions}
                  customMessage={invitation?.customMessage}
                  customTagline={invitation?.customTagline}
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom message */}
        {invitation?.customMessage && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-5 text-center">
            <p className="text-sm italic text-rose-800 leading-relaxed">
              &ldquo;{invitation.customMessage}&rdquo;
            </p>
            <p className="mt-2 text-xs text-rose-500">
              — {event.brideName} &amp; {event.groomName}
            </p>
          </div>
        )}

        {/* Ceremonies */}
        {functions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900 text-lg">
              Celebrations
            </h2>
            {functions.map((fn) => (
              <CeremonyCard key={fn.functionId} fn={fn} />
            ))}
          </div>
        )}

        {/* RSVP note */}
        <div className="rounded-2xl bg-slate-100 px-5 py-4 text-center">
          <p className="text-sm text-slate-600">
            To RSVP, use the personal link sent to you by the couple.
          </p>
        </div>

        {/* Footer */}
        <div className="pb-6 text-center text-xs text-slate-400">
          Created with MarriageVerse
        </div>
      </div>
    </div>
  );
}
