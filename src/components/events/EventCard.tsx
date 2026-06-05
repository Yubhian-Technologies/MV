"use client";

import Link from "next/link";
import { CalendarHeart, Users, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EventStatusBadge } from "./EventStatusBadge";
import type { WeddingEvent } from "@/types";

interface EventCardProps {
  event: WeddingEvent;
}

export function EventCard({ event }: EventCardProps) {
  const date =
    event.weddingDate instanceof Date
      ? event.weddingDate
      : new Date(event.weddingDate);

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link href={`/events/${event.eventId}`} className="group block">
      <Card className="overflow-hidden border-slate-100 shadow-sm transition-all group-hover:border-rose-200 group-hover:shadow-md">
        {/* Colour strip */}
        <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-400" />

        <CardContent className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                {event.title}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarHeart className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                {formattedDate}
              </div>
            </div>
            <EventStatusBadge status={event.status} />
          </div>

          {/* Location */}
          <div className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">
              {[event.city, event.state, event.country].filter(Boolean).join(", ")}
            </span>
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-2">
            {[
              { label: "Guests", value: event.totalGuests },
              { label: "Confirmed", value: event.rsvpConfirmed },
              { label: "Pending", value: event.rsvpPending },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 text-center">
                <p className="text-base font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="h-3.5 w-3.5" />
              <span>{event.totalGuests} invited</span>
            </div>
            <span className="flex items-center gap-1 font-medium text-rose-600 opacity-0 transition-opacity group-hover:opacity-100">
              View event <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
