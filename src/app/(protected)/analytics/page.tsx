"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  CalendarHeart,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getHostEvents } from "@/lib/firebase/events";
import { useAuth } from "@/lib/hooks/useAuth";
import type { WeddingEvent } from "@/types";
import { toast } from "sonner";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getHostEvents(user.uid)
      .then(setEvents)
      .catch(() => toast.error("Could not load analytics."))
      .finally(() => setLoading(false));
  }, [user]);

  const totalGuests = events.reduce((s, e) => s + e.totalGuests, 0);
  const rsvpConfirmed = events.reduce((s, e) => s + e.rsvpConfirmed, 0);
  const rsvpPending = events.reduce((s, e) => s + e.rsvpPending, 0);
  const rsvpDeclined = events.reduce((s, e) => s + e.rsvpDeclined, 0);
  const responseRate =
    totalGuests > 0 ? Math.round(((rsvpConfirmed + rsvpDeclined) / totalGuests) * 100) : 0;
  const acceptanceRate =
    rsvpConfirmed + rsvpDeclined > 0
      ? Math.round((rsvpConfirmed / (rsvpConfirmed + rsvpDeclined)) * 100)
      : 0;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Summary across {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Events" value={events.length} icon={CalendarHeart} color="text-rose-600" bg="bg-rose-50" />
        <StatCard label="Total Guests" value={totalGuests} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Confirmed RSVPs" value={rsvpConfirmed} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" sub={`${acceptanceRate}% acceptance rate`} />
        <StatCard label="Response Rate" value={`${responseRate}%`} icon={TrendingUp} color="text-violet-600" bg="bg-violet-50" sub={`${rsvpPending} still pending`} />
      </div>

      {/* RSVP breakdown */}
      {totalGuests > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">RSVP Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "Confirmed", value: rsvpConfirmed, color: "bg-emerald-500", textColor: "text-emerald-700" },
              { label: "Pending", value: rsvpPending, color: "bg-amber-400", textColor: "text-amber-700" },
              { label: "Declined", value: rsvpDeclined, color: "bg-red-400", textColor: "text-red-600" },
            ].map(({ label, value, color, textColor }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${textColor}`}>{label}</span>
                  <span className="text-slate-600">
                    {value} <span className="text-slate-400">/ {totalGuests}</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${totalGuests > 0 ? (value / totalGuests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-event breakdown */}
      {events.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Per Event</h2>
          <div className="space-y-3">
            {events.map((event) => {
              const rate = event.totalGuests > 0
                ? Math.round((event.rsvpConfirmed / event.totalGuests) * 100)
                : 0;
              return (
                <div key={event.eventId} className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.city}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />{event.rsvpConfirmed}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="h-3.5 w-3.5" />{event.rsvpPending}
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-3.5 w-3.5" />{event.rsvpDeclined}
                    </span>
                    <span className="w-10 text-right text-xs text-slate-400">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming soon banner */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 px-6 py-5 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
          <BarChart3 className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <p className="font-semibold text-violet-900">Deeper analytics coming soon</p>
          <p className="mt-0.5 text-sm text-violet-700">
            Guest source tracking, per-function attendance, timeline charts, and export reports are in development.
          </p>
        </div>
      </div>
    </div>
  );
}
