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
  deleteGuest,
  type AddGuestData,
} from "@/lib/firebase/guests";
import { guestSchema, type GuestInput } from "@/lib/validations/guest";
import { cn } from "@/lib/utils";
import type { WeddingEvent, EventFunction, Guest } from "@/types";
import { toast } from "sonner";

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

function SideBadge({ side }: { side: Guest["side"] }) {
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", SIDE_STYLES[side])}>
      {SIDE_LABELS[side]}
    </span>
  );
}

function RsvpBadge({ status }: { status: Guest["rsvpStatus"] }) {
  const Icon = RSVP_ICONS[status];
  return (
    <span className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", RSVP_STYLES[status])}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

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
      invitedFunctions: functions.map((f) => f.functionId),
      ...defaultValues,
    },
  });

  const selectedSide = watch("side");
  const selectedFunctions = watch("invitedFunctions") ?? [];

  const handleFunctionToggle = (fnId: string) => {
    const current = selectedFunctions;
    setValue(
      "invitedFunctions",
      current.includes(fnId)
        ? current.filter((id) => id !== fnId)
        : [...current, fnId]
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
          <Label htmlFor="g-email">Email <span className="font-normal text-slate-400">(optional)</span></Label>
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
          {errors.seatCount && <p className="text-xs text-red-500">{errors.seatCount.message}</p>}
        </div>
      </div>

      {/* Invited functions */}
      {functions.length > 0 && (
        <div className="space-y-1.5">
          <Label>Invited to</Label>
          <div className="flex flex-wrap gap-2">
            {functions.map((fn) => {
              const checked = selectedFunctions.includes(fn.functionId);
              const displayName = fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
              return (
                <button
                  key={fn.functionId}
                  type="button"
                  onClick={() => handleFunctionToggle(fn.functionId)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    checked
                      ? "border-rose-400 bg-rose-100 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"
                  )}
                >
                  {checked ? "✓ " : ""}{displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="g-notes">Notes <span className="font-normal text-slate-400">(optional)</span></Label>
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
}: {
  guest: Guest;
  functions: EventFunction[];
  event: WeddingEvent;
  onEdit: (g: Guest) => void;
  onDelete: (g: Guest) => void;
}) {
  const [copied, setCopied] = useState(false);
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

  const handleCopyRsvp = async () => {
    if (!rsvpUrl) return;
    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const handleWhatsApp = () => {
    if (!rsvpUrl) return;
    const firstName = guest.name.split(" ")[0];
    const weddingDate = event.weddingDate instanceof Date
      ? event.weddingDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      : "";
    const message = `Dear ${firstName},\n\nYou're personally invited to celebrate *${event.title}*! 🎊\n\nPlease RSVP here:\n${rsvpUrl}\n\n📅 ${weddingDate} · 📍 ${event.city}\n\nWith love,\n${event.brideName} & ${event.groomName}`;
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
          <SideBadge side={guest.side} />
          <RsvpBadge status={guest.rsvpStatus} />
          <span className="text-xs text-slate-400">{guest.seatCount} seat{guest.seatCount !== 1 ? "s" : ""}</span>
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

        {invitedNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {invitedNames.map((name) => (
              <span key={name} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {name}
              </span>
            ))}
          </div>
        )}

        {guest.notes && (
          <p className="text-xs italic text-slate-400 truncate">{guest.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {/* RSVP share buttons — only for guests with a token */}
        {rsvpUrl && (
          <>
            <button
              onClick={handleCopyRsvp}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Copy RSVP link"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
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
      };
      const id = await addGuest(eventId, payload);
      const newGuest: Guest = {
        guestId: id,
        ...payload,
        groups: [],
        rsvpStatus: "pending",
        rsvpToken: "",
        shareStatus: "not_sent",
        addedBy: "manual",
        createdAt: new Date(),
      };
      setGuests((prev) => [...prev, newGuest].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddForm(false);
      toast.success(`${data.name} added to guest list.`);
    },
    [eventId]
  );

  const handleEdit = useCallback(
    async (data: GuestInput) => {
      if (!editingGuest) return;
      await updateGuest(eventId, editingGuest.guestId, {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        side: data.side,
        invitedFunctions: data.invitedFunctions,
        seatCount: data.seatCount,
        notes: data.notes || undefined,
      });
      setGuests((prev) =>
        prev
          .map((g) =>
            g.guestId === editingGuest.guestId
              ? { ...g, ...data, phone: data.phone || undefined, email: data.email || undefined, notes: data.notes || undefined }
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

  // Stats
  const totalBride = guests.filter((g) => g.side === "bride").length;
  const totalGroom = guests.filter((g) => g.side === "groom").length;
  const totalMutual = guests.filter((g) => g.side === "mutual").length;
  const totalConfirmed = guests.filter((g) => g.rsvpStatus === "confirmed").length;
  const totalPending = guests.filter((g) => g.rsvpStatus === "pending").length;

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

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: guests.length, icon: Users, color: "text-slate-700", bg: "bg-slate-100" },
          { label: "Bride's Side", value: totalBride, icon: Users, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Groom's Side", value: totalGroom, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Confirmed", value: totalConfirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl ${bg} px-4 py-3`}>
            <Icon className={`h-5 w-5 ${color}`} />
            <div>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add guest form */}
      {showAddForm && (
        <GuestForm
          functions={functions}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Add Guest"
        />
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3">
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

      {/* Guest list */}
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
            onClick={() => { setSearch(""); setSideFilter("all"); setRsvpFilter("all"); }}
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
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
