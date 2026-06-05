"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarHeart,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Share2,
  Pencil,
  Trash2,
  Plus,
  ChevronRight,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { FunctionListItem } from "@/components/events/FunctionListItem";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  getEvent,
  getEventFunctions,
  deleteEvent,
} from "@/lib/firebase/events";
import { getGuests } from "@/lib/firebase/guests";
import { getEventRsvps } from "@/lib/firebase/rsvp";
import type { WeddingEvent, EventFunction, Guest, RSVPResponse } from "@/types";
import { toast } from "sonner";

const STAT_CARDS = (event: WeddingEvent) => [
  {
    label: "Total Guests",
    value: event.totalGuests,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Confirmed",
    value: event.rsvpConfirmed,
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Pending",
    value: event.rsvpPending,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [functions, setFunctions] = useState<EventFunction[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RSVPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      getEvent(eventId),
      getEventFunctions(eventId),
      getGuests(eventId),
      getEventRsvps(eventId),
    ])
      .then(([ev, fns, gs, rs]) => {
        if (!ev) { router.replace("/events"); return; }
        setEvent(ev);
        setFunctions(fns);
        setGuests(gs);
        setRsvps(rs);
      })
      .catch(() => toast.error("Could not load event."))
      .finally(() => setLoading(false));
  }, [eventId, router]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this event permanently? All guests and RSVPs will be lost."
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted.");
      router.push("/events");
    } catch {
      toast.error("Failed to delete event.");
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return null;

  const weddingDate =
    event.weddingDate instanceof Date
      ? event.weddingDate
      : new Date(event.weddingDate);

  const formattedDate = weddingDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-rose-600">Events</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium truncate">{event.title}</span>
      </nav>

      {/* Event header */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarHeart className="h-4 w-4 text-rose-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" />
                {[event.city, event.state, event.country].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/events/${eventId}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-slate-200 text-slate-600"
              )}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-40"
              )}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STAT_CARDS(event).map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ceremonies">
        <TabsList className="border-b border-slate-100 bg-transparent p-0 rounded-none gap-0 h-auto">
          {[
            { value: "ceremonies", label: "Ceremonies" },
            { value: "guests", label: "Guests" },
            { value: "rsvp", label: "RSVP" },
            { value: "share", label: "Share" },
            { value: "analytics", label: "Analytics" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:border-rose-600 data-[state=active]:text-rose-700 data-[state=active]:bg-transparent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Ceremonies tab */}
        <TabsContent value="ceremonies" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {functions.length} Ceremon{functions.length === 1 ? "y" : "ies"}
            </h2>
            <Link
              href={`/events/create/functions?eventId=${eventId}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-rose-200 text-rose-600 hover:bg-rose-50"
              )}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Ceremony
            </Link>
          </div>

          {functions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-slate-500">No ceremonies added yet.</p>
              <Link
                href={`/events/create/functions?eventId=${eventId}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-4 bg-rose-600 hover:bg-rose-700"
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Ceremony
              </Link>
            </div>
          ) : (
            functions.map((fn) => (
              <FunctionListItem
                key={fn.functionId}
                eventId={eventId}
                fn={fn}
                onDeleted={(id) =>
                  setFunctions((prev) => prev.filter((f) => f.functionId !== id))
                }
                onEdit={() => {
                  router.push(`/events/create/functions?eventId=${eventId}`);
                }}
              />
            ))
          )}
        </TabsContent>

        {/* Guests tab — live summary */}
        <TabsContent value="guests" className="mt-6 space-y-4">
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-14 text-center space-y-3">
              <Users className="h-10 w-10 text-slate-300" />
              <div>
                <p className="font-medium text-slate-600">No guests added yet</p>
                <p className="text-sm text-slate-400 mt-0.5">Start building your guest list</p>
              </div>
              <Link
                href={`/events/${eventId}/guests`}
                className={cn(buttonVariants({ variant: "default" }), "bg-rose-600 hover:bg-rose-700")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Guests
              </Link>
            </div>
          ) : (
            <>
              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total", value: guests.length, color: "text-slate-700", bg: "bg-slate-100" },
                  { label: "Bride's Side", value: guests.filter(g => g.side === "bride").length, color: "text-rose-600", bg: "bg-rose-50" },
                  { label: "Groom's Side", value: guests.filter(g => g.side === "groom").length, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Confirmed", value: guests.filter(g => g.rsvpStatus === "confirmed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl ${bg} px-4 py-3`}>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              {/* Preview list (top 5) */}
              <div className="space-y-2">
                {guests.slice(0, 5).map((g) => (
                  <div key={g.guestId} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="flex-1 text-sm font-medium text-slate-900">{g.name}</p>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      g.rsvpStatus === "confirmed" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : g.rsvpStatus === "declined" ? "bg-red-100 text-red-600 border-red-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {g.rsvpStatus}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={`/events/${eventId}/guests`}
                className={cn(buttonVariants({ variant: "outline" }), "w-full border-rose-200 text-rose-600 hover:bg-rose-50")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage All {guests.length} Guests
              </Link>
            </>
          )}
        </TabsContent>

        {/* Share tab — invitation management */}
        <TabsContent value="share" className="mt-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 py-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
              <Sparkles className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Create Your Digital Invitation</p>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">
                Choose from 8 beautifully designed templates and customise your invitation in minutes.
              </p>
            </div>
            <Link
              href={`/events/${eventId}/invitation`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-rose-600 hover:bg-rose-700"
              )}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Set Up Invitation
            </Link>
          </div>
        </TabsContent>

        {/* RSVP tab — live submissions */}
        <TabsContent value="rsvp" className="mt-6 space-y-4">
          {rsvps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-14 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-600">No RSVPs yet</p>
              <p className="text-sm text-slate-400">
                Share guest RSVP links from the Guests page. Responses appear here.
              </p>
              <Link
                href={`/events/${eventId}/guests`}
                className={cn(buttonVariants({ variant: "outline" }), "mt-2 border-rose-200 text-rose-600 hover:bg-rose-50")}
              >
                <Users className="mr-2 h-4 w-4" />
                Go to Guests
              </Link>
            </div>
          ) : (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Responses", value: rsvps.length, color: "text-slate-700", bg: "bg-slate-100" },
                  { label: "Attending", value: rsvps.filter(r => Object.values(r.functionResponses).some(f => f.status === "attending")).length, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Total Guests", value: rsvps.reduce((s, r) => s + r.totalAttendees, 0), color: "text-rose-600", bg: "bg-rose-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl ${bg} px-4 py-3`}>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* RSVP list */}
              <div className="space-y-2">
                {rsvps.map((r) => {
                  const isAttending = Object.values(r.functionResponses).some(f => f.status === "attending");
                  const isDeclined  = Object.values(r.functionResponses).every(f => f.status === "not_attending");
                  return (
                    <div key={r.rsvpId} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                        {r.guestName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm">{r.guestName}</p>
                        <p className="text-xs text-slate-400">
                          {r.submittedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {r.dietaryPreference !== "veg" && ` · ${r.dietaryPreference.replace("_", "-")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.totalAttendees > 0 && (
                          <span className="text-xs text-slate-500">{r.totalAttendees} guest{r.totalAttendees !== 1 ? "s" : ""}</span>
                        )}
                        <span className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          isDeclined  ? "border-red-200 bg-red-100 text-red-600" :
                          isAttending ? "border-emerald-200 bg-emerald-100 text-emerald-700" :
                                        "border-amber-200 bg-amber-100 text-amber-700"
                        )}>
                          {isDeclined ? "Declined" : isAttending ? "Attending" : "Maybe"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* Analytics placeholder */}
        <TabsContent value="analytics" className="mt-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-600">Analytics</p>
            <p className="mt-1 text-sm text-slate-400">Coming in Phase 7</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
