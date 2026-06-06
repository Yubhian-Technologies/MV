"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarHeart,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { getHostEventsWithStats } from "@/lib/firebase/events";
import { useAuth } from "@/lib/hooks/useAuth";
import type { WeddingEvent } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getHostEventsWithStats(user.uid)
      .then(setEvents)
      .catch(() => toast.error("Could not load events."))
      .finally(() => setLoading(false));
  }, [user]);

  const totalGuests = events.reduce((sum, e) => sum + (e.totalGuests ?? 0), 0);
  const rsvpConfirmed = events.reduce((sum, e) => sum + (e.rsvpConfirmed ?? 0), 0);
  const rsvpPending = events.reduce((sum, e) => sum + (e.rsvpPending ?? 0), 0);

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: CalendarHeart,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Total Guests",
      value: totalGuests,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "RSVPs Confirmed",
      value: rsvpConfirmed,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "RSVPs Pending",
      value: rsvpPending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Header */}
      <DashboardWelcome />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {loading ? "—" : value}
                </p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events section */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
              <CalendarHeart className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Create your first wedding event
              </h2>
              <p className="max-w-sm text-sm text-slate-500">
                Add your wedding details, choose a beautiful invitation template,
                and start managing your guests — all in one place.
              </p>
            </div>
            <Link
              href="/events/create/details"
              className={cn(buttonVariants({ variant: "default" }), "bg-rose-600 px-6 hover:bg-rose-700")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Recent events */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Events</h2>
            <Link
              href="/events"
              className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "New Event",
            description: "Create another wedding event",
            icon: Plus,
            href: "/events/create/details",
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
          {
            title: "Choose a Template",
            description: "Browse 50+ beautiful invitation designs",
            icon: Sparkles,
            href: "/templates",
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            title: "Import Guests",
            description: "Add your guest list via CSV or manually",
            icon: Users,
            href: "/events",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map(({ title, description, icon: Icon, href, color, bg }) => (
          <Link
            key={title}
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-rose-100 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 group-hover:text-rose-600 transition-colors">
                {title}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
