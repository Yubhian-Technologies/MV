"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarHeart,
  ArrowRight,
  Plus,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getHostEvents } from "@/lib/firebase/events";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { WeddingEvent } from "@/types";
import { toast } from "sonner";

function EventGuestCard({ event }: { event: WeddingEvent }) {
  const date = event.weddingDate instanceof Date
    ? event.weddingDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{date} · {event.city}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
            event.status === "active"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          )}
        >
          {event.status === "active" ? "Active" : "Draft"}
        </span>
      </div>

      {/* Guest stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Total", value: event.totalGuests, icon: Users, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Confirmed", value: event.rsvpConfirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending", value: event.rsvpPending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Declined", value: event.rsvpDeclined, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`flex flex-col items-center gap-1 rounded-xl ${bg} py-2.5 px-1`}>
            <Icon className={`h-4 w-4 ${color}`} />
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <Link
        href={`/events/${event.eventId}/guests`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-700"
        )}
      >
        Manage Guests
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}

export default function GuestsPage() {
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

  const totalGuests = events.reduce((s, e) => s + e.totalGuests, 0);
  const totalConfirmed = events.reduce((s, e) => s + e.rsvpConfirmed, 0);
  const totalPending = events.reduce((s, e) => s + e.rsvpPending, 0);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Guest Management</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {totalGuests} total guests across {events.length} event{events.length !== 1 ? "s" : ""}
          {totalConfirmed > 0 ? ` · ${totalConfirmed} confirmed · ${totalPending} pending` : ""}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <Users className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No events yet</h2>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Create an event first, then add your guest list.
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
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Events", value: events.length, icon: CalendarHeart, color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Total Guests", value: totalGuests, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Confirmed", value: totalConfirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Pending", value: totalPending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`flex items-center gap-3 rounded-xl ${bg} px-4 py-3.5`}>
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Per-event cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventGuestCard key={event.eventId} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
