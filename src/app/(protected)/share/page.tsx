"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Share2, CalendarHeart, Plus, Send, Palette } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SharePanel } from "@/components/sharing/SharePanel";
import { getHostEvents } from "@/lib/firebase/events";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { WeddingEvent } from "@/types";
import { toast } from "sonner";

function EventShareCard({ event }: { event: WeddingEvent }) {
  const date = event.weddingDate instanceof Date
    ? event.weddingDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "";

  const isPublished = event.status === "active";
  const invitationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/i/${event.shareCode}`
    : `/i/${event.shareCode}`;
  const whatsappMessage = `💍 *${event.title}* are getting married!\n\nView their wedding invitation:\n${invitationUrl}\n\n📅 ${date} · 📍 ${event.city}`;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{date} · {event.city}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
            isPublished
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
          )}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {isPublished ? (
        <SharePanel url={invitationUrl} whatsappMessage={whatsappMessage} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center space-y-3">
          {event.invitationId ? (
            <>
              <div className="flex justify-center">
                <Send className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                Invitation is in draft. Publish it to get a shareable link.
              </p>
              <Link
                href={`/events/${event.eventId}/invitation`}
                className={cn(buttonVariants({ variant: "outline" }), "border-slate-200 text-slate-700 text-sm")}
              >
                Publish Invitation
              </Link>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <Palette className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                No invitation created yet for this event.
              </p>
              <Link
                href="/templates"
                className={cn(buttonVariants({ variant: "outline" }), "border-slate-200 text-slate-700 text-sm")}
              >
                Choose a Template
              </Link>
            </>
          )}
        </div>
      )}

      <Link
        href={`/events/${event.eventId}`}
        className="block text-xs text-center text-slate-400 hover:text-rose-600 transition-colors"
      >
        View Event →
      </Link>
    </div>
  );
}

export default function SharePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getHostEvents(user.uid)
      .then(setEvents)
      .catch(() => toast.error("Could not load events."))
      .finally(() => setLoading(false));
  }, [user]);

  const publishedCount = events.filter((e) => e.status === "active").length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Share Invitations</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {publishedCount} of {events.length} invitation{events.length !== 1 ? "s" : ""} published and ready to share
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <Share2 className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Nothing to share yet</h2>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Create an event and publish your invitation to generate a shareable link.
          </p>
          <Link
            href="/events/create/details"
            className={cn(buttonVariants({ variant: "default" }), "mt-6 bg-rose-600 hover:bg-rose-700")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventShareCard key={event.eventId} event={event} />
          ))}
        </div>
      )}

      {/* Tip */}
      {events.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Tip:</span> Send personal RSVP links to each guest from the{" "}
            <Link href="/guests" className="underline hover:text-blue-900">Guests</Link> page.
            The invitation link above is for general sharing (social media, group chats).
          </p>
        </div>
      )}
    </div>
  );
}
