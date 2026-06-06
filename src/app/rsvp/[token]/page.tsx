"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  CalendarHeart,
  Heart,
  Utensils,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TemplateFullPreview } from "@/components/templates/TemplatePreviewRenderer";
import { getByRsvpToken, submitRsvp, type FunctionRsvp } from "@/lib/firebase/rsvp";
import { getEventInvitation } from "@/lib/firebase/invitations";
import { getTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { Guest, WeddingEvent, EventFunction, Invitation, InvitationTemplate } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FN_EMOJI: Record<string, string> = {
  Mehndi: "💚", Haldi: "💛", Sangeet: "🎵", Engagement: "💍",
  Wedding: "🙏", Reception: "🎉", Custom: "✨",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" });
}
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// ─── Ceremony Card ────────────────────────────────────────────────────────────

function CeremonyCard({
  fn,
  value,
  onChange,
}: {
  fn: EventFunction;
  value: FunctionRsvp;
  onChange: (v: FunctionRsvp) => void;
}) {
  const displayName = fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
  const emoji = FN_EMOJI[fn.name] ?? "✨";
  const fnDate = fn.date instanceof Date ? fn.date : new Date(fn.date);

  const OPTS = [
    { status: "attending" as const, label: "Attending", icon: CheckCircle2, style: "border-emerald-400 bg-emerald-50 text-emerald-700" },
    { status: "maybe" as const, label: "Maybe", icon: HelpCircle, style: "border-amber-400 bg-amber-50 text-amber-700" },
    { status: "not_attending" as const, label: "Not Going", icon: XCircle, style: "border-red-300 bg-red-50 text-red-600" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{displayName}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <CalendarHeart className="h-3.5 w-3.5 shrink-0" />
            {formatDate(fnDate)}{fn.startTime ? ` · ${formatTime(fn.startTime)}` : ""}
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {fn.venueName}, {fn.venueCity}
          </p>
          {fn.dressCode && (
            <p className="text-xs text-slate-400 mt-1">Dress code: {fn.dressCode}</p>
          )}
        </div>
      </div>

      {/* Attendance options */}
      <div className="grid grid-cols-3 gap-2">
        {OPTS.map(({ status, label, icon: Icon, style }) => (
          <button
            key={status}
            type="button"
            onClick={() => onChange({ ...value, status })}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-medium transition-all",
              value.status === status ? style : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Attendee count — shown when attending or maybe */}
      {(value.status === "attending" || value.status === "maybe") && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">How many people?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, attendeeCount: Math.max(1, value.attendeeCount - 1) })}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              disabled={value.attendeeCount <= 1}
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-slate-900">
              {value.attendeeCount}
            </span>
            <button
              type="button"
              onClick={() => onChange({ ...value, attendeeCount: Math.min(20, value.attendeeCount + 1) })}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              disabled={value.attendeeCount >= 20}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Already Responded / Thank-You Screen ────────────────────────────────────

function AlreadyRsvpd({
  guest,
  event,
  functions,
  invitation,
  template,
  onUpdate,
}: {
  guest: Guest;
  event: WeddingEvent;
  functions: EventFunction[];
  invitation: Invitation | null;
  template: InvitationTemplate | null;
  onUpdate: () => void;
}) {
  const isAttending = guest.rsvpStatus === "confirmed";
  const isDeclined  = guest.rsvpStatus === "declined";

  const statusCfg = {
    confirmed: { label: "Attending",       bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    declined:  { label: "Not Attending",   bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200"     },
    maybe:     { label: "Maybe Attending", bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
    pending:   { label: "Pending",         bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200"   },
  }[guest.rsvpStatus];

  const weddingDate = event.weddingDate instanceof Date ? event.weddingDate : new Date(event.weddingDate);
  const headerBg = template?.bg ?? "linear-gradient(160deg, #9f1239 0%, #be185d 50%, #9f1239 100%)";
  const accentColor = template?.accentColor ?? "#fff";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50/30">
      {/* Invitation-style header using template colours */}
      <div className="px-6 py-12 text-center text-white" style={{ background: headerBg }}>
        <p className="text-sm font-light tracking-widest uppercase opacity-80 mb-3">
          {invitation?.customTagline || "Wedding Invitation"}
        </p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: accentColor }}>{event.brideName}</h1>
        <p className="text-2xl font-light opacity-80 my-1">&amp;</p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: accentColor }}>{event.groomName}</h1>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-80">
          <CalendarHeart className="h-4 w-4" />
          {weddingDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          <span>·</span>
          <MapPin className="h-4 w-4" />
          {event.city}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-8 space-y-5">
        {/* Designed invitation card */}
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

        {/* Thank-you card */}
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              isAttending ? "bg-emerald-100" : isDeclined ? "bg-red-50" : "bg-amber-100"
            )}>
              {isAttending
                ? <Heart className="h-8 w-8 text-emerald-600" fill="currentColor" />
                : isDeclined
                  ? <XCircle className="h-8 w-8 text-red-500" />
                  : <HelpCircle className="h-8 w-8 text-amber-500" />
              }
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAttending
                ? "Thank you for joining us! 🎉"
                : isDeclined
                  ? "We&apos;ll miss you! 💙"
                  : "Thank you for responding!"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Dear {guest.name.split(" ")[0]}, your RSVP has been saved.
            </p>
          </div>

          <span className={cn(
            "inline-block rounded-full border px-4 py-1.5 text-sm font-semibold",
            statusCfg.bg, statusCfg.text, statusCfg.border
          )}>
            {statusCfg.label}
          </span>
        </div>

        {/* Ceremony details for attending guests */}
        {isAttending && functions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Your confirmed ceremonies:</p>
            {functions.map((fn) => {
              const displayName = fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
              const fnDate = fn.date instanceof Date ? fn.date : new Date(fn.date);
              return (
                <div key={fn.functionId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-start gap-3">
                  <span className="text-xl mt-0.5">{FN_EMOJI[fn.name] ?? "✨"}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{displayName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <CalendarHeart className="h-3 w-3 shrink-0" />
                      {formatDate(fnDate)}{fn.startTime ? ` · ${formatTime(fn.startTime)}` : ""}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {fn.venueName}, {fn.venueCity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View full invitation */}
        {event.shareCode && event.status === "active" && (
          <a
            href={`/i/${event.shareCode}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3.5 text-sm font-medium text-rose-700 transition-all hover:bg-rose-100"
          >
            View Full Invitation 💌
          </a>
        )}

        {/* Subtle change-response link */}
        <button
          type="button"
          onClick={onUpdate}
          className="w-full py-2 text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Need to change your response?
        </button>

        <p className="text-center text-xs text-slate-400 pb-4">
          Powered by MarriageVerse Invitations
        </p>
      </div>
    </div>
  );
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────

function Confirmation({
  guest,
  event,
  functions,
  responses,
}: {
  guest: Guest;
  event: WeddingEvent;
  functions: EventFunction[];
  responses: Record<string, FunctionRsvp>;
}) {
  const attending = functions.filter((f) => responses[f.functionId]?.status === "attending");
  const overallConfirmed = attending.length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full",
            overallConfirmed ? "bg-emerald-100" : "bg-slate-100"
          )}>
            {overallConfirmed
              ? <Heart className="h-10 w-10 text-emerald-600" fill="currentColor" />
              : <CheckCircle2 className="h-10 w-10 text-slate-500" />
            }
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {overallConfirmed ? "You're all set!" : "Response received!"}
          </h1>
          <p className="mt-1 text-slate-500">
            Thank you, {guest.name.split(" ")[0]}. Your RSVP has been saved.
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm text-left space-y-3">
          <p className="font-semibold text-slate-900 text-sm">Your responses</p>
          {functions.map((fn) => {
            const r = responses[fn.functionId];
            if (!r) return null;
            const displayName = fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
            return (
              <div key={fn.functionId} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">
                  {FN_EMOJI[fn.name] ?? "✨"} {displayName}
                </span>
                <span className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  r.status === "attending"     ? "border-emerald-200 bg-emerald-100 text-emerald-700" :
                  r.status === "not_attending" ? "border-red-200 bg-red-100 text-red-600" :
                                                 "border-amber-200 bg-amber-100 text-amber-700"
                )}>
                  {r.status === "attending" ? `Attending · ${r.attendeeCount}` :
                   r.status === "maybe"     ? `Maybe · ${r.attendeeCount}` : "Not going"}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-rose-600 font-medium">
          {event.brideName} &amp; {event.groomName} can&apos;t wait to celebrate with you! 🎉
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState<{ guest: Guest; event: WeddingEvent; functions: EventFunction[] } | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [template, setTemplate] = useState<InvitationTemplate | null>(null);

  // Per-function RSVP state
  const [responses, setResponses] = useState<Record<string, FunctionRsvp>>({});

  // Global form state
  const [dietary, setDietary] = useState<"veg" | "non_veg" | "jain" | "other">("veg");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRsvpd, setAlreadyRsvpd] = useState(false);

  useEffect(() => {
    getByRsvpToken(token)
      .then(async (result) => {
        if (!result) { setNotFound(true); return; }
        setData(result);
        // If the guest already responded in a previous session, skip the form
        if (result.guest.rsvpStatus !== "pending") {
          setAlreadyRsvpd(true);
        }
        // Default all functions to "attending" with seatCount = guest.seatCount
        const initial: Record<string, FunctionRsvp> = {};
        for (const fn of result.functions) {
          initial[fn.functionId] = { status: "attending", attendeeCount: result.guest.seatCount };
        }
        setResponses(initial);
        // Fetch the designed invitation + template (non-blocking — show even if missing)
        try {
          const inv = await getEventInvitation(result.event.eventId);
          if (inv) {
            setInvitation(inv);
            const t = getTemplate(inv.templateId);
            if (t) setTemplate(t);
          }
        } catch { /* ignore — invitation preview is optional */ }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      await submitRsvp(
        data.event.eventId,
        data.guest.guestId,
        data.guest.name,
        data.guest.phone,
        data.guest.rsvpStatus,
        { functionResponses: responses, dietaryPreference: dietary, dietaryNotes, message }
      );
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ──
  if (loading) return <LoadingSpinner fullPage />;

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-5xl">🔍</div>
          <h1 className="text-xl font-bold text-slate-900">Invalid RSVP Link</h1>
          <p className="text-slate-500 text-sm">
            This RSVP link is invalid or has expired. Please contact the couple for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (alreadyRsvpd && data) {
    return (
      <AlreadyRsvpd
        guest={data.guest}
        event={data.event}
        functions={data.functions}
        invitation={invitation}
        template={template}
        onUpdate={() => setAlreadyRsvpd(false)}
      />
    );
  }

  if (submitted && data) {
    return (
      <Confirmation
        guest={data.guest}
        event={data.event}
        functions={data.functions}
        responses={responses}
      />
    );
  }

  if (!data) return null;

  const { guest, event, functions } = data;
  const weddingDate = event.weddingDate instanceof Date ? event.weddingDate : new Date(event.weddingDate);
  const headerBg = template?.bg ?? "linear-gradient(160deg, #9f1239 0%, #be185d 50%, #9f1239 100%)";
  const accentColor = template?.accentColor ?? "#fff";

  const DIETARY_OPTS = [
    { value: "veg" as const, label: "🥗 Veg" },
    { value: "non_veg" as const, label: "🍖 Non-Veg" },
    { value: "jain" as const, label: "🌱 Jain" },
    { value: "other" as const, label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50/30">
      {/* Invitation header — styled with the couple's chosen template */}
      <div className="px-6 py-12 text-center text-white" style={{ background: headerBg }}>
        <p className="text-sm font-light tracking-widest uppercase opacity-80 mb-3">
          {invitation?.customTagline || "Wedding Invitation"}
        </p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: accentColor }}>
          {event.brideName}
        </h1>
        <p className="text-2xl font-light opacity-80 my-1">&amp;</p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: accentColor }}>
          {event.groomName}
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-80">
          <CalendarHeart className="h-4 w-4" />
          {weddingDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          <span>·</span>
          <MapPin className="h-4 w-4" />
          {event.city}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        {/* Designed invitation card */}
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

        {/* Personalized greeting */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-center">
          <p className="text-rose-800 font-medium">
            Dear {guest.name.split(" ")[0]},
          </p>
          <p className="text-sm text-rose-700 mt-1">
            You&apos;re warmly invited to celebrate with us. Please let us know if you can make it!
          </p>
        </div>

        {/* Ceremony responses */}
        {functions.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Your Invitations</h2>
            {functions.map((fn) => (
              <CeremonyCard
                key={fn.functionId}
                fn={fn}
                value={responses[fn.functionId] ?? { status: "attending", attendeeCount: 1 }}
                onChange={(v) => setResponses((prev) => ({ ...prev, [fn.functionId]: v }))}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-slate-500 text-sm">
            No ceremonies listed yet.
          </div>
        )}

        {/* Dietary preference */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Dietary Preference</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DIETARY_OPTS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDietary(value)}
                className={cn(
                  "rounded-xl border py-2.5 text-sm font-medium transition-all",
                  dietary === value
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Any specific dietary notes? (optional)"
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Personal message */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Message for the Couple{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </h2>
          <textarea
            placeholder="Write a heartfelt message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || functions.length === 0}
          className="w-full rounded-2xl bg-rose-600 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Submitting…
            </span>
          ) : (
            "Submit My RSVP 💌"
          )}
        </button>

        <p className="text-center text-xs text-slate-400 pb-4">
          Powered by MarriageVerse Invitations
        </p>
      </div>
    </div>
  );
}
