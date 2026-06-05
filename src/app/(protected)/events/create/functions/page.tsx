"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Plus, ChevronRight, ChevronLeft, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FunctionListItem } from "@/components/events/FunctionListItem";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  addFunction,
  getEvent,
  getEventFunctions,
  updateEvent,
} from "@/lib/firebase/events";
import {
  addFunctionSchema,
  FUNCTION_PRESETS,
  type AddFunctionInput,
} from "@/lib/validations/event";
import type { EventFunction, WeddingEvent } from "@/types";
import { toast } from "sonner";

function AddFunctionForm({
  onAdded,
  onCancel,
  eventId,
  nextOrder,
  editTarget,
}: {
  onAdded: (fn: EventFunction) => void;
  onCancel: () => void;
  eventId: string;
  nextOrder: number;
  editTarget?: EventFunction | null;
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddFunctionInput>({
    resolver: zodResolver(addFunctionSchema),
    defaultValues: editTarget
      ? {
          name: editTarget.name,
          customName: editTarget.customName ?? "",
          date: editTarget.date instanceof Date
            ? editTarget.date.toISOString().split("T")[0]
            : "",
          startTime: editTarget.startTime,
          endTime: editTarget.endTime ?? "",
          venueName: editTarget.venueName,
          venueAddress: editTarget.venueAddress,
          venueCity: editTarget.venueCity,
          dressCode: editTarget.dressCode ?? "",
          notes: editTarget.notes ?? "",
        }
      : { name: "", date: "", startTime: "" },
  });

  const selectedName = watch("name");

  const onSubmit = async (data: AddFunctionInput) => {
    setSaving(true);
    try {
      const id = await addFunction(eventId, {
        name: data.name,
        customName: data.customName ?? "",
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime ?? "",
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueCity: data.venueCity,
        dressCode: data.dressCode ?? "",
        notes: data.notes ?? "",
        order: nextOrder,
      });
      const displayName =
        data.name === "Custom" && data.customName ? data.customName : data.name;
      toast.success(`"${displayName}" added!`);
      onAdded({
        functionId: id,
        name: data.name,
        customName: data.customName ?? "",
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime ?? "",
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueCity: data.venueCity,
        dressCode: data.dressCode ?? "",
        notes: data.notes ?? "",
        order: nextOrder,
        rsvpConfirmed: 0,
        rsvpDeclined: 0,
      });
    } catch {
      toast.error("Failed to add ceremony. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-4"
      noValidate
    >
      <h3 className="font-semibold text-slate-900">Add Ceremony</h3>

      {/* Function type */}
      <div className="space-y-1.5">
        <Label>Ceremony type</Label>
        <div className="flex flex-wrap gap-2">
          {FUNCTION_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("name", value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                selectedName === value
                  ? "border-rose-400 bg-rose-100 text-rose-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Custom name */}
      {selectedName === "Custom" && (
        <div className="space-y-1.5">
          <Label htmlFor="customName">Custom ceremony name</Label>
          <Input
            id="customName"
            placeholder="e.g., Tilak Ceremony"
            {...register("customName")}
            className={errors.customName ? "border-red-400" : ""}
          />
          {errors.customName && (
            <p className="text-xs text-red-500">{errors.customName.message}</p>
          )}
        </div>
      )}

      {/* Date & Time */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="fn-date">Date</Label>
          <Input
            id="fn-date"
            type="date"
            {...register("date")}
            className={errors.date ? "border-red-400" : ""}
          />
          {errors.date && (
            <p className="text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            type="time"
            {...register("startTime")}
            className={errors.startTime ? "border-red-400" : ""}
          />
          {errors.startTime && (
            <p className="text-xs text-red-500">{errors.startTime.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endTime">
            End time{" "}
            <span className="font-normal text-slate-400">(opt.)</span>
          </Label>
          <Input id="endTime" type="time" {...register("endTime")} />
        </div>
      </div>

      {/* Venue */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="venueName">Venue name</Label>
          <Input
            id="venueName"
            placeholder="e.g., The Grand Ballroom"
            {...register("venueName")}
            className={errors.venueName ? "border-red-400" : ""}
          />
          {errors.venueName && (
            <p className="text-xs text-red-500">{errors.venueName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="venueCity">Venue city</Label>
          <Input
            id="venueCity"
            placeholder="e.g., Mumbai"
            {...register("venueCity")}
            className={errors.venueCity ? "border-red-400" : ""}
          />
          {errors.venueCity && (
            <p className="text-xs text-red-500">{errors.venueCity.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="venueAddress">Full address</Label>
        <Input
          id="venueAddress"
          placeholder="Street, area, city"
          {...register("venueAddress")}
          className={errors.venueAddress ? "border-red-400" : ""}
        />
        {errors.venueAddress && (
          <p className="text-xs text-red-500">{errors.venueAddress.message}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dressCode">
            Dress code{" "}
            <span className="font-normal text-slate-400">(opt.)</span>
          </Label>
          <Input
            id="dressCode"
            placeholder="e.g., Ethnic / Formal"
            {...register("dressCode")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fn-notes">
            Notes{" "}
            <span className="font-normal text-slate-400">(opt.)</span>
          </Label>
          <Input
            id="fn-notes"
            placeholder="Any special instructions"
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-rose-600 hover:bg-rose-700"
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Saving…
            </span>
          ) : (
            "Add Ceremony"
          )}
        </Button>
      </div>
    </form>
  );
}

function FunctionsPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";
  const router = useRouter();

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [functions, setFunctions] = useState<EventFunction[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<EventFunction | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!eventId) {
      router.replace("/events/create/details");
      return;
    }
    Promise.all([getEvent(eventId), getEventFunctions(eventId)])
      .then(([ev, fns]) => {
        if (!ev) { router.replace("/events"); return; }
        setEvent(ev);
        setFunctions(fns);
        if (fns.length === 0) setShowForm(true);
      })
      .catch(() => toast.error("Could not load event data."))
      .finally(() => setLoadingPage(false));
  }, [eventId, router]);

  const handleAdded = (fn: EventFunction) => {
    setFunctions((prev) => [...prev, fn]);
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDeleted = (id: string) =>
    setFunctions((prev) => prev.filter((f) => f.functionId !== id));

  const handleEdit = (fn: EventFunction) => {
    setEditTarget(fn);
    setShowForm(true);
  };

  const handleFinish = async () => {
    if (functions.length === 0) {
      toast.error("Add at least one ceremony before continuing.");
      return;
    }
    setFinishing(true);
    try {
      await updateEvent(eventId, { status: "active" });
      toast.success("Event published! 🎉");
      router.push(`/events/${eventId}`);
    } catch {
      toast.error("Failed to publish event. Please try again.");
    } finally {
      setFinishing(false);
    }
  };

  if (loadingPage) return <LoadingSpinner fullPage />;

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-rose-600">Events</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="hover:text-rose-600 cursor-default">{event?.title}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">Add Ceremonies</span>
      </nav>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
          ✓
        </div>
        <div className="h-px flex-1 bg-rose-300" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white">
          2
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Ceremonies</h1>
          <p className="mt-1 text-slate-500">
            Step 2 of 2 — Add all your wedding functions (Mehndi, Haldi, Sangeet, Wedding, Reception…).
          </p>
        </div>

        {/* Function list */}
        {functions.length > 0 && (
          <div className="space-y-3">
            {functions.map((fn) => (
              <FunctionListItem
                key={fn.functionId}
                eventId={eventId}
                fn={fn}
                onDeleted={handleDeleted}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {/* Add form */}
        {showForm ? (
          <AddFunctionForm
            eventId={eventId}
            nextOrder={functions.length}
            editTarget={editTarget}
            onAdded={handleAdded}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        ) : (
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditTarget(null); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-5 text-sm font-medium text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          >
            <Plus className="h-4 w-4" />
            Add another ceremony
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/events/create/details`}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to details
          </Link>
          <Button
            onClick={handleFinish}
            className="bg-rose-600 px-6 hover:bg-rose-700"
            disabled={finishing || functions.length === 0}
          >
            {finishing ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Publishing…
              </span>
            ) : (
              <>
                <PartyPopper className="mr-2 h-4 w-4" />
                Publish Event
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreateFunctionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <FunctionsPageContent />
    </Suspense>
  );
}
