"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles, Check, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TemplateFullPreview } from "@/components/templates/TemplatePreviewRenderer";
import { getTemplate } from "@/lib/templates";
import { getHostEvents } from "@/lib/firebase/events";
import { createInvitation, getEventInvitation, updateInvitation } from "@/lib/firebase/invitations";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { InvitationTemplate, WeddingEvent } from "@/types";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  traditional: "Traditional",
  floral: "Floral",
  royal: "Royal",
  modern: "Modern",
  festive: "Festive",
};

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [template, setTemplate] = useState<InvitationTemplate | null>(null);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [applying, setApplying] = useState<string | null>(null); // eventId being applied

  useEffect(() => {
    const t = getTemplate(templateId);
    if (!t) { router.replace("/templates"); return; }
    setTemplate(t);
  }, [templateId, router]);

  const handleUseTemplate = async () => {
    if (!user) return;
    setLoadingEvents(true);
    try {
      const evs = await getHostEvents(user.uid);
      setEvents(evs);
      setShowPicker(true);
    } catch {
      toast.error("Could not load your events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleApplyToEvent = async (eventId: string) => {
    if (!user || !template) return;
    setApplying(eventId);
    try {
      const existing = await getEventInvitation(eventId);
      if (existing) {
        await updateInvitation(existing.invitationId, { templateId: template.templateId });
        toast.success("Template updated!");
      } else {
        await createInvitation(user.uid, eventId, template.templateId);
        toast.success("Template applied!");
      }
      router.push(`/events/${eventId}/invitation`);
    } catch {
      toast.error("Failed to apply template. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  if (!template) return <LoadingSpinner fullPage />;

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/templates" className="hover:text-rose-600">Templates</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">{template.name}</span>
      </nav>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        {/* Left — preview */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-8">
          <TemplateFullPreview template={template} />
          <p className="text-xs text-slate-400 text-center">
            Preview with sample data · Your event details will appear here
          </p>
        </div>

        {/* Right — info + apply */}
        <div className="flex flex-1 flex-col gap-6 lg:max-w-md">
          {/* Name + badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full border border-slate-200 px-3 py-0.5 text-xs font-medium text-slate-600">
                {CATEGORY_LABELS[template.category] ?? template.category}
              </span>
              {template.isPremium ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-semibold text-amber-700">
                  <Sparkles className="h-3 w-3" />
                  Pro Template
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                  Free
                </span>
              )}
              <span className="rounded-full border border-slate-200 px-3 py-0.5 text-xs text-slate-500">
                {template.region}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{template.name}</h1>
            <p className="mt-2 text-slate-500 leading-relaxed">{template.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
            <p className="font-semibold text-slate-900 text-sm">What&apos;s included</p>
            {[
              "Fully customizable couple names & message",
              "All ceremony / function listings",
              "Date, venue, and dress code sections",
              "WhatsApp-ready shareable link",
              "Live RSVP tracking",
            ].map((feat) => (
              <div key={feat} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-slate-600">{feat}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {template.isPremium ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center space-y-3">
              <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
              <p className="font-semibold text-amber-900">Pro Template</p>
              <p className="text-sm text-amber-700">Upgrade to Premium to use this template.</p>
              <Link
                href="/settings"
                className={cn(buttonVariants({ variant: "default" }), "bg-amber-500 hover:bg-amber-600 w-full")}
              >
                Upgrade to Premium
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {!showPicker ? (
                <Button
                  className="w-full bg-rose-600 py-3 text-base hover:bg-rose-700"
                  onClick={handleUseTemplate}
                  disabled={loadingEvents}
                >
                  {loadingEvents ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Loading events…
                    </span>
                  ) : (
                    "Use This Template"
                  )}
                </Button>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
                  <p className="font-semibold text-slate-900 text-sm">Apply to which event?</p>

                  {events.length === 0 ? (
                    <div className="text-center py-4 space-y-3">
                      <CalendarHeart className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="text-sm text-slate-500">You have no events yet.</p>
                      <Link
                        href="/events/create/details"
                        className={cn(buttonVariants({ variant: "default" }), "bg-rose-600 hover:bg-rose-700")}
                      >
                        Create an Event First
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((ev) => {
                        const date =
                          ev.weddingDate instanceof Date
                            ? ev.weddingDate
                            : new Date(ev.weddingDate);
                        return (
                          <button
                            key={ev.eventId}
                            onClick={() => handleApplyToEvent(ev.eventId)}
                            disabled={!!applying}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition-all hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{ev.title}</p>
                              <p className="text-xs text-slate-500">
                                {date.toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {" · "}
                                {ev.city}
                              </p>
                            </div>
                            {applying === ev.eventId ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    className="text-xs text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPicker(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
