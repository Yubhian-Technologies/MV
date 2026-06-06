"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CalendarHeart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventCard } from "@/components/events/EventCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getHostEventsWithStats } from "@/lib/firebase/events";
import { useAuth } from "@/lib/hooks/useAuth";
import type { WeddingEvent } from "@/types";
import { toast } from "sonner";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getHostEventsWithStats(user.uid)
      .then(setEvents)
      .catch(() => toast.error("Could not load events. Check your connection."))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {events.length > 0
              ? `${events.length} event${events.length > 1 ? "s" : ""} created`
              : "Create your first wedding event to get started"}
          </p>
        </div>
        <Link
          href="/events/create/details"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-rose-600 hover:bg-rose-700"
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <CalendarHeart className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            No events yet
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
            Create your first wedding event and start building your invitation,
            guest list, and RSVP flow.
          </p>
          <Link
            href="/events/create/details"
            className={cn(
              buttonVariants({ variant: "default" }),
              "mt-6 bg-rose-600 hover:bg-rose-700"
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Event
          </Link>
        </div>
      ) : (
        /* Events grid */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
