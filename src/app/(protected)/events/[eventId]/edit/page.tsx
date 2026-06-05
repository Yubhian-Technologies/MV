"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getEvent, updateEvent } from "@/lib/firebase/events";
import { editEventSchema, type EditEventInput } from "@/lib/validations/event";
import type { WeddingEvent } from "@/types";
import { toast } from "sonner";

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditEventInput>({
    resolver: zodResolver(editEventSchema),
  });

  useEffect(() => {
    if (!eventId) return;
    getEvent(eventId)
      .then((ev) => {
        if (!ev) { router.replace("/events"); return; }
        setEvent(ev);
        const date =
          ev.weddingDate instanceof Date
            ? ev.weddingDate
            : new Date(ev.weddingDate);
        reset({
          brideName: ev.brideName,
          groomName: ev.groomName,
          weddingDate: date.toISOString().split("T")[0],
          city: ev.city,
          state: ev.state ?? "",
          country: ev.country,
        });
      })
      .catch(() => toast.error("Could not load event."))
      .finally(() => setLoading(false));
  }, [eventId, reset, router]);

  const brideName = watch("brideName", "");
  const groomName = watch("groomName", "");

  const onSubmit = async (data: EditEventInput) => {
    setSaving(true);
    try {
      await updateEvent(eventId, {
        brideName: data.brideName,
        groomName: data.groomName,
        title: `${data.brideName} & ${data.groomName}`,
        weddingDate: new Date(data.weddingDate),
        city: data.city,
        state: data.state ?? "",
        country: data.country,
      });
      toast.success("Event updated successfully.");
      router.push(`/events/${eventId}`);
    } catch {
      toast.error("Failed to update event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return null;

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-rose-600">Events</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/events/${eventId}`} className="hover:text-rose-600 truncate max-w-[160px]">
          {event.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">Edit</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
          <p className="mt-1 text-slate-500">Update your wedding event details.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Names */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-slate-900">The Couple</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brideName">Bride&apos;s name</Label>
                <Input
                  id="brideName"
                  {...register("brideName")}
                  className={errors.brideName ? "border-red-400" : ""}
                />
                {errors.brideName && (
                  <p className="text-xs text-red-500">{errors.brideName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="groomName">Groom&apos;s name</Label>
                <Input
                  id="groomName"
                  {...register("groomName")}
                  className={errors.groomName ? "border-red-400" : ""}
                />
                {errors.groomName && (
                  <p className="text-xs text-red-500">{errors.groomName.message}</p>
                )}
              </div>
            </div>
            {brideName && groomName && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Event title preview</p>
                <p className="mt-1 text-xl font-bold text-rose-700">
                  {brideName} &amp; {groomName}
                </p>
              </div>
            )}
          </div>

          {/* Date & Location */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-slate-900">Date &amp; Location</h2>

            <div className="space-y-1.5">
              <Label htmlFor="weddingDate">Wedding date</Label>
              <Input
                id="weddingDate"
                type="date"
                {...register("weddingDate")}
                className={errors.weddingDate ? "border-red-400" : ""}
              />
              {errors.weddingDate && (
                <p className="text-xs text-red-500">{errors.weddingDate.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} className={errors.city ? "border-red-400" : ""} />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State <span className="font-normal text-slate-400">(optional)</span></Label>
                <Input id="state" {...register("state")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} className={errors.country ? "border-red-400" : ""} />
              {errors.country && (
                <p className="text-xs text-red-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href={`/events/${eventId}`}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Cancel
            </Link>
            <Button type="submit" className="bg-rose-600 px-6 hover:bg-rose-700" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
