"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Phone,
  Mail,
  Copy,
  Check,
  MessageCircle,
  Send,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getEvent, getEventFunctions } from "@/lib/firebase/events";
import {
  getGuests,
  addGuest,
  updateGuest,
  updateGuestRsvp,
  deleteGuest,
  type AddGuestData,
} from "@/lib/firebase/guests";
import { guestSchema, type GuestInput } from "@/lib/validations/guest";
import { cn } from "@/lib/utils";
import type { WeddingEvent, EventFunction, Guest } from "@/types";
import { toast } from "sonner";

// ─── Guest Categories ────────────────────────────────────────────────────────

const GUEST_CATEGORIES = [
  {
    value: "Family",
    label: "Family",
    emoji: "🏠",
    hint: "Invited to all ceremonies",
    bg: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    value: "Friends",
    label: "Friends",
    emoji: "👥",
    hint: "Sangeet · Wedding · Reception",
    bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    value: "Colleagues",
    label: "Colleagues",
    emoji: "💼",
    hint: "Reception only",
    bg: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    value: "Others",
    label: "Others",
    emoji: "🤝",
    hint: "Wedding · Reception",
    bg: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
] as const;

type GuestCategory = (typeof GUEST_CATEGORIES)[number]["value"];

// Names that each category should be invited to by default
const CATEGORY_FN_NAMES: Record<GuestCategory, string[] | "all"> = {
  Family: "all",
  Friends: ["Sangeet", "Engagement", "Wedding", "Reception"],
  Colleagues: ["Reception"],
  Others: ["Wedding", "Reception"],
};

function getDefaultFunctions(category: GuestCategory, fns: EventFunction[]): string[] {
  const rule = CATEGORY_FN_NAMES[category];
  if (rule === "all") return fns.map((f) => f.functionId);
  const matched = fns.filter((f) => rule.includes(f.name)).map((f) => f.functionId);
  // fallback to all if no name match (e.g. only custom ceremonies)
  return matched.length > 0 ? matched : fns.map((f) => f.functionId);
}

function categoryMeta(category: string | undefined) {
  return GUEST_CATEGORIES.find((c) => c.value === category);
}

// ─── Badges ─────────────────────────────────────────────────────────────────

const SIDE_STYLES = {
  bride: "bg-rose-100 text-rose-700 border-rose-200",
  groom: "bg-blue-100 text-blue-700 border-blue-200",
  mutual: "bg-violet-100 text-violet-700 border-violet-200",
};
const SIDE_LABELS = { bride: "Bride's", groom: "Groom's", mutual: "Mutual" };

const RSVP_STYLES = {
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  declined: "bg-red-100 text-red-600 border-red-200",
  maybe: "bg-amber-100 text-amber-700 border-amber-200",
};
const RSVP_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  declined: XCircle,
  maybe: HelpCircle,
};
const RSVP_STATUS_LABELS: Record<Guest["rsvpStatus"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  maybe: "Maybe",
};

const FN_EMOJI: Record<string, string> = {
  Mehndi: "💚",
  Haldi: "💛",
  Sangeet: "🎵",
  Engagement: "💍",
  Wedding: "🙏",
  Reception: "🎉",
  Custom: "✨",
};

// ─── Guest Form ──────────────────────────────────────────────────────────────

function GuestForm({
  functions,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Add Guest",
}: {
  functions: EventFunction[];
  defaultValues?: Partial<GuestInput>;
  onSubmit: (data: GuestInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GuestCategory | "">(
    (defaultValues?.category as GuestCategory) || ""
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      side: "mutual",
      seatCount: 1,
      category: "",
      invitedFunctions: functions.map((f) => f.functionId),
      ...defaultValues,
    },
  });

  const selectedSide = watch("side");
  const selectedFunctions = watch("invitedFunctions") ?? [];

  const handleCategorySelect = (cat: GuestCategory) => {
    setSelectedCategory(cat);
    setValue("category", cat);
    setValue("invitedFunctions", getDefaultFunctions(cat, functions));
  };

  const handleFunctionToggle = (fnId: string) => {
    setValue(
      "invitedFunctions",
      selectedFunctions.includes(fnId)
        ? selectedFunctions.filter((id) => id !== fnId)
        : [...selectedFunctions, fnId]
    );
  };

  const doSubmit = async (data: GuestInput) => {
    setSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(doSubmit)}
      noValidate
      className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-4"
    >
      {/* Name / Phone / Email */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="g-name">Name *</Label>
          <Input
            id="g-name"
            placeholder="e.g., Rahul Sharma"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-phone">
            Phone <span className="font-normal text-slate-400">(for WhatsApp)</span>
          </Label>
          <Input
            id="g-phone"
            type="tel"
            placeholder="+91 98765 43210"
            {...register("phone")}
            className={errors.phone ? "border-red-400" : ""}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-email">
            Email <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input
            id="g-email"
            type="email"
            placeholder="guest@example.com"
            {...register("email")}
            className={errors.email ? "border-red-400" : ""}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      {/* Side + Seat count */}
      <div className="flex flex-wrap gap-6 items-start">
        <div className="space-y-1.5">
          <Label>Side</Label>
          <div className="flex gap-2">
            {(["bride", "groom", "mutual"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue("side", s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                  selectedSide === s
                    ? SIDE_STYLES[s] + " ring-1 ring-offset-1"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {SIDE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-seats">Seats</Label>
          <Input
            id="g-seats"
            type="number"
            min={1}
            max={20}
            className="w-20"
            {...register("seatCount", { valueAsNumber: true })}
          />
          {errors.seatCount && (
            <p className="text-xs text-red-500">{errors.seatCount.message}</p>
          )}
        </div>
      </div>

      {/* Guest Type / Category */}
      <div className="space-y-2">
        <Label>Guest Type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GUEST_CATEGORIES.map(({ value, label, emoji, hint, bg }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleCategorySelect(value)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                selectedCategory === value
                  ? bg + " ring-1 ring-offset-1"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <span className="text-base">{emoji} <span className="text-sm font-semibold">{label}</span></span>
              <span className={cn("text-[10px]", selectedCategory === value ? "opacity-80" : "text-slate-400")}>
                {hint}
              </span>
            </button>
          ))}
        </div>
        {selectedCategory && (
          <p className="text-xs text-slate-500">
            Ceremony selection auto-set for <strong>{selectedCategory}</strong> — adjust below if needed.
          </p>
        )}
      </div>

      {/* Invited to — per ceremony checkboxes */}
      {functions.length > 0 && (
        <div className="space-y-1.5">
          <Label>Invited ceremonies</Label>
          <div className="flex flex-wrap gap-2">
            {functions.map((fn) => {
              const checked = selectedFunctions.includes(fn.functionId);
              const displayName =
                fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
              const emoji = FN_EMOJI[fn.name] ?? "✨";
              return (
                <button
                  key={fn.functionId}
                  type="button"
                  onClick={() => handleFunctionToggle(fn.functionId)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    checked
                      ? "border-rose-400 bg-rose-100 text-rose-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-rose-200"
                  )}
                >
                  <span>{emoji}</span>
                  {checked && <Check className="h-3 w-3" />}
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="g-notes">
          Notes <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <Textarea
          id="g-notes"
          placeholder="Dietary preferences, seating requests…"
          rows={2}
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Saving…
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Guest Row ───────────────────────────────────────────────────────────────

function GuestRow({
  guest,
  functions,
  event,
  onEdit,
  onDelete,
  onRsvpChange,
}: {
  guest: Guest;
  functions: EventFunction[];
  event: WeddingEvent;
  onEdit: (g: Guest) => void;
  onDelete: (g: Guest) => void;
  onRsvpChange: (guest: Guest, newStatus: Guest["rsvpStatus"]) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showRsvpMenu, setShowRsvpMenu] = useState(false);

  const fnMap = Object.fromEntries(functions.map((f) => [f.functionId, f]));
  const invitedNames = guest.invitedFunctions
    .map((id) => {
      const fn = fnMap[id];
      if (!fn) return null;
      return fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
    })
    .filter(Boolean) as string[];

  const rsvpUrl = guest.rsvpToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/rsvp/${guest.rsvpToken}`
    : "";

  // guest category from groups[0]
  const cat = categoryMeta(guest.groups?.[0]);

  const handleCopyRsvp = async () => {
    if (!rsvpUrl) return;
    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  const handleWhatsApp = () => {
    if (!rsvpUrl) return;
    const firstName = guest.name.split(" ")[0];
    const weddingDate =
      event.weddingDate instanceof Date
        ? event.weddingDate.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";
    const message = `💍 *Wedding Invitation*\n\nDear ${firstName},\n\n*${event.brideName} & ${event.groomName}* are getting married and would love to have you with them! 🎊\n\n📅 *${weddingDate}*\n📍 *${event.city}*\n\nKindly respond using your personal RSVP link:\n👉 ${rsvpUrl}\n\n_With love & blessings,_\n*${event.brideName} & ${event.groomName}*`;
    const phone = guest.phone ? guest.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition-all hover:border-slate-200 hover:shadow-sm">
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
        {guest.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{guest.name}</p>

          {/* Category badge */}
          {cat && (
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", cat.bg)}>
              {cat.emoji} {cat.label}
            </span>
          )}

          {/* Side badge */}
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", SIDE_STYLES[guest.side])}>
            {SIDE_LABELS[guest.side]}
          </span>

          {/* Clickable RSVP badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRsvpMenu((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                RSVP_STYLES[guest.rsvpStatus]
              )}
              title="Click to change RSVP status"
            >
              {(() => { const Icon = RSVP_ICONS[guest.rsvpStatus]; return <Icon className="h-3 w-3" />; })()}
              {RSVP_STATUS_LABELS[guest.rsvpStatus]}
              <span className="ml-0.5 opacity-60">▾</span>
            </button>
            {showRsvpMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {(["pending", "confirmed", "declined", "maybe"] as const).map((s) => {
                  const Icon = RSVP_ICONS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setShowRsvpMenu(false);
                        if (s !== guest.rsvpStatus) onRsvpChange(guest, s);
                      }}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        s === guest.rsvpStatus ? RSVP_STYLES[s] : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {RSVP_STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span className="text-xs text-slate-400">
            {guest.seatCount} seat{guest.seatCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {guest.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />{guest.phone}
            </span>
          )}
          {guest.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />{guest.email}
            </span>
          )}
        </div>

        {/* Invited ceremonies */}
        {invitedNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {invitedNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
              >
                {FN_EMOJI[name] ?? "✨"} {name}
              </span>
            ))}
          </div>
        )}

        {guest.notes && (
          <p className="text-xs italic text-slate-400 truncate">{guest.notes}</p>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {rsvpUrl && (
          <>
            <button
              onClick={handleCopyRsvp}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Copy RSVP link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleWhatsApp}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600"
              title="Send RSVP via WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        <button
          onClick={() => onEdit(guest)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(guest)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type SideFilter = "all" | Guest["side"];
type RsvpFilter = "all" | Guest["rsvpStatus"];
type CatFilter = "all" | GuestCategory;

export default function GuestsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [functions, setFunctions] = useState<EventFunction[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>("all");
  const [catFilter, setCatFilter] = useState<CatFilter>("all");
  const [fnFilter, setFnFilter] = useState<"all" | string>("all");

  useEffect(() => {
    if (!eventId) return;
    Promise.all([getEvent(eventId), getEventFunctions(eventId), getGuests(eventId)])
      .then(([ev, fns, gs]) => {
        if (!ev) { router.replace("/events"); return; }
        setEvent(ev);
        setFunctions(fns);
        setGuests(gs);
      })
      .catch(() => toast.error("Could not load guests."))
      .finally(() => setLoading(false));
  }, [eventId, router]);

  const filtered = guests.filter((g) => {
    if (sideFilter !== "all" && g.side !== sideFilter) return false;
    if (rsvpFilter !== "all" && g.rsvpStatus !== rsvpFilter) return false;
    if (catFilter !== "all" && g.groups?.[0] !== catFilter) return false;
    if (fnFilter !== "all" && !g.invitedFunctions.includes(fnFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.phone?.includes(q) ||
        g.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdd = useCallback(
    async (data: GuestInput) => {
      const payload: AddGuestData = {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        side: data.side,
        invitedFunctions: data.invitedFunctions,
        seatCount: data.seatCount,
        notes: data.notes || undefined,
        groups: data.category ? [data.category] : [],
      };
      const { guestId, rsvpToken } = await addGuest(eventId, payload);
      const newGuest: Guest = {
        guestId,
        ...payload,
        groups: payload.groups ?? [],
        rsvpStatus: "pending",
        rsvpToken,
        shareStatus: "not_sent",
        addedBy: "manual",
        createdAt: new Date(),
      };
      setGuests((prev) =>
        [...prev, newGuest].sort((a, b) => a.name.localeCompare(b.name))
      );
      setShowAddForm(false);
      toast.success(`${data.name} added to guest list.`);
    },
    [eventId]
  );

  const handleEdit = useCallback(
    async (data: GuestInput) => {
      if (!editingGuest) return;
      const updatePayload = {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        side: data.side,
        invitedFunctions: data.invitedFunctions,
        seatCount: data.seatCount,
        notes: data.notes || undefined,
        groups: data.category ? [data.category] : (editingGuest.groups ?? []),
      };
      await updateGuest(eventId, editingGuest.guestId, updatePayload);
      setGuests((prev) =>
        prev
          .map((g) =>
            g.guestId === editingGuest.guestId
              ? { ...g, ...updatePayload, phone: data.phone || undefined, email: data.email || undefined, notes: data.notes || undefined }
              : g
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingGuest(null);
      toast.success("Guest updated.");
    },
    [eventId, editingGuest]
  );

  const handleDelete = useCallback(
    async (guest: Guest) => {
      if (!confirm(`Remove ${guest.name} from the guest list?`)) return;
      await deleteGuest(eventId, guest);
      setGuests((prev) => prev.filter((g) => g.guestId !== guest.guestId));
      toast.success(`${guest.name} removed.`);
    },
    [eventId]
  );

  const handleRsvpChange = useCallback(
    async (guest: Guest, newStatus: Guest["rsvpStatus"]) => {
      await updateGuestRsvp(eventId, guest.guestId, newStatus, guest.rsvpStatus);
      setGuests((prev) =>
        prev.map((g) =>
          g.guestId === guest.guestId ? { ...g, rsvpStatus: newStatus } : g
        )
      );
      toast.success(`${guest.name} marked as ${newStatus}.`);
    },
    [eventId]
  );

  // ── Stats ──
  const totalConfirmed = guests.filter((g) => g.rsvpStatus === "confirmed").length;
  const totalPending = guests.filter(
    (g) => g.rsvpStatus === "pending" || g.rsvpStatus === "maybe"
  ).length;

  // active ceremony filter name for the send banner
  const activeFn = functions.find((f) => f.functionId === fnFilter);

  const clearAllFilters = () => {
    setSearch("");
    setSideFilter("all");
    setRsvpFilter("all");
    setCatFilter("all");
    setFnFilter("all");
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return null;

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-rose-600">Events</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/events/${eventId}`} className="hover:text-rose-600 truncate max-w-[160px]">
          {event.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">Guests</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest List</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {guests.length} guest{guests.length !== 1 ? "s" : ""} · {totalConfirmed} confirmed · {totalPending} pending
          </p>
        </div>
        {!showAddForm && !editingGuest && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-rose-600 hover:bg-rose-700 shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        )}
      </div>

      {/* ── Send Invitations by Ceremony ───────────────────────────────────── */}
      {functions.length > 0 && guests.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-rose-500" />
            <h2 className="font-semibold text-slate-900">Send Invitations by Ceremony</h2>
          </div>
          <p className="text-xs text-slate-500">
            Click a ceremony to filter the guest list to only those invited. Then send WhatsApp individually.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {functions.map((fn) => {
              const fnName = fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
              const emoji = FN_EMOJI[fn.name] ?? "✨";
              const count = guests.filter((g) => g.invitedFunctions.includes(fn.functionId)).length;
              const isActive = fnFilter === fn.functionId;
              const fnDate = fn.date instanceof Date ? fn.date : new Date(fn.date);
              return (
                <button
                  key={fn.functionId}
                  type="button"
                  onClick={() => setFnFilter(isActive ? "all" : fn.functionId)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                    isActive
                      ? "border-rose-400 bg-rose-50 ring-1 ring-rose-300"
                      : "border-slate-100 hover:border-rose-200 hover:bg-rose-50/30"
                  )}
                >
                  <span className="text-2xl mt-0.5">{emoji}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{fnName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <CalendarDays className="h-3 w-3" />
                      {fnDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <p className={cn("text-xs font-medium mt-1", isActive ? "text-rose-600" : "text-slate-500")}>
                      {count} guest{count !== 1 ? "s" : ""} invited
                    </p>
                  </div>
                  {isActive && (
                    <span className="ml-auto shrink-0 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Guest Type Summary ─────────────────────────────────────────────── */}
      {guests.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GUEST_CATEGORIES.map(({ value, label, emoji, bg, dot }) => {
            const count = guests.filter((g) => g.groups?.[0] === value).length;
            const isActive = catFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCatFilter(isActive ? "all" : value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                  isActive ? bg + " ring-1 ring-offset-1" : "border-slate-100 bg-white hover:border-slate-200"
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dot)} />
                <div>
                  <p className="text-sm font-bold text-slate-900">{count}</p>
                  <p className="text-[10px] text-slate-500">{emoji} {label}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Add guest form */}
      {showAddForm && (
        <GuestForm
          functions={functions}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Add Guest"
        />
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Side filter */}
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {(["all", "bride", "groom", "mutual"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSideFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-all",
                  sideFilter === s
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {s === "all" ? "All" : SIDE_LABELS[s]}
              </button>
            ))}
          </div>

          {/* RSVP filter */}
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {(["all", "pending", "confirmed", "declined", "maybe"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRsvpFilter(r)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all",
                  rsvpFilter === r
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {r === "all" ? "All RSVP" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter pills */}
        {(catFilter !== "all" || fnFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2">
            {catFilter !== "all" && (
              <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", categoryMeta(catFilter)?.bg)}>
                {categoryMeta(catFilter)?.emoji} {catFilter}
                <button onClick={() => setCatFilter("all")} className="ml-1 opacity-60 hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {fnFilter !== "all" && activeFn && (
              <span className="flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                {FN_EMOJI[activeFn.name] ?? "✨"} {activeFn.name === "Custom" && activeFn.customName ? activeFn.customName : activeFn.name}
                <button onClick={() => setFnFilter("all")} className="ml-1 opacity-60 hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-xs text-slate-400 hover:text-rose-600 underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Send banner when ceremony filter active ─────────────────────────── */}
      {activeFn && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">
            {FN_EMOJI[activeFn.name] ?? "✨"}{" "}
            <strong>{activeFn.name === "Custom" && activeFn.customName ? activeFn.customName : activeFn.name}</strong>
            {" "}— {filtered.length} guest{filtered.length !== 1 ? "s" : ""} to invite.
            Send WhatsApp to each using the <MessageCircle className="inline h-3.5 w-3.5" /> icon on their row.
          </p>
        </div>
      )}

      {/* ── Guest list ─────────────────────────────────────────────────────── */}
      {guests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <Users className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No guests yet</h2>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Add guests one by one or import a CSV list to get started.
          </p>
          <Button
            className="mt-6 bg-rose-600 hover:bg-rose-700"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Guest
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">No guests match your filters.</p>
          <button
            onClick={clearAllFilters}
            className="mt-2 text-sm text-rose-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {guests.length} guests
          </p>
          {filtered.map((guest) =>
            editingGuest?.guestId === guest.guestId ? (
              <GuestForm
                key={guest.guestId}
                functions={functions}
                defaultValues={{
                  name: guest.name,
                  phone: guest.phone ?? "",
                  email: guest.email ?? "",
                  side: guest.side,
                  category: guest.groups?.[0] ?? "",
                  invitedFunctions: guest.invitedFunctions,
                  seatCount: guest.seatCount,
                  notes: guest.notes ?? "",
                }}
                onSubmit={handleEdit}
                onCancel={() => setEditingGuest(null)}
                submitLabel="Save Changes"
              />
            ) : (
              <GuestRow
                key={guest.guestId}
                guest={guest}
                functions={functions}
                event={event}
                onEdit={setEditingGuest}
                onDelete={handleDelete}
                onRsvpChange={handleRsvpChange}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
