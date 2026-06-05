"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/lib/firebase/events";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/lib/validations/event";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export default function CreateEventDetailsPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { country: "India" },
  });

  const brideName = watch("brideName", "");
  const groomName = watch("groomName", "");
  const previewTitle =
    brideName && groomName ? `${brideName} & ${groomName}` : null;

  const onSubmit = async (data: CreateEventInput) => {
    if (!user) return;
    setLoading(true);
    try {
      const eventId = await createEvent(user.uid, {
        brideName: data.brideName,
        groomName: data.groomName,
        weddingDate: new Date(data.weddingDate),
        city: data.city,
        state: data.state ?? "",
        country: data.country,
      });
      toast.success("Event created! Now add your ceremonies.");
      router.push(`/events/create/functions?eventId=${eventId}`);
    } catch {
      toast.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-rose-600">Events</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">Create Event</span>
      </nav>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white">
          1
        </div>
        <div className="h-px flex-1 bg-slate-200" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-500">
          2
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Event Details</h1>
          <p className="mt-1 text-slate-500">
            Step 1 of 2 — Basic information about your wedding event.
          </p>
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
                  placeholder="e.g., Priya"
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
                  placeholder="e.g., Arjun"
                  {...register("groomName")}
                  className={errors.groomName ? "border-red-400" : ""}
                />
                {errors.groomName && (
                  <p className="text-xs text-red-500">{errors.groomName.message}</p>
                )}
              </div>
            </div>

            {previewTitle && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Your event will appear as</p>
                <p className="mt-1 text-xl font-bold text-rose-700">{previewTitle}</p>
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
                <Input
                  id="city"
                  placeholder="e.g., Mumbai"
                  {...register("city")}
                  className={errors.city ? "border-red-400" : ""}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">
                  State{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <Input
                  id="state"
                  placeholder="e.g., Maharashtra"
                  {...register("state")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., India"
                {...register("country")}
                className={errors.country ? "border-red-400" : ""}
              />
              {errors.country && (
                <p className="text-xs text-red-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Cancel
            </Link>
            <Button
              type="submit"
              className="bg-rose-600 px-6 hover:bg-rose-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </span>
              ) : (
                <>
                  Continue to Ceremonies
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
