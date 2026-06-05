import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { RSVPResponse, Guest, WeddingEvent, EventFunction } from "@/types";
import { getEventFunctions } from "./events";

// ─── Token index ─────────────────────────────────────────────────────────────

export async function writeRsvpTokenIndex(
  token: string,
  eventId: string,
  guestId: string
): Promise<void> {
  await setDoc(doc(db, "rsvpTokens", token), { eventId, guestId });
}

export type TokenLookup = {
  guest: Guest;
  event: WeddingEvent;
  functions: EventFunction[];
};

export async function getByRsvpToken(
  token: string
): Promise<TokenLookup | null> {
  // 1. Look up the token index
  const idxSnap = await getDoc(doc(db, "rsvpTokens", token));
  if (!idxSnap.exists()) return null;
  const { eventId, guestId } = idxSnap.data() as { eventId: string; guestId: string };

  // 2. Fetch event, guest, functions in parallel
  const [evSnap, guestSnap, fns] = await Promise.all([
    getDoc(doc(db, "events", eventId)),
    getDoc(doc(db, "events", eventId, "guests", guestId)),
    getEventFunctions(eventId),
  ]);

  if (!evSnap.exists() || !guestSnap.exists()) return null;

  const evData = evSnap.data() as Record<string, unknown>;
  const gData  = guestSnap.data() as Record<string, unknown>;

  const event: WeddingEvent = {
    eventId: evSnap.id,
    hostId: evData.hostId as string,
    title: evData.title as string,
    brideName: evData.brideName as string,
    groomName: evData.groomName as string,
    weddingDate:
      evData.weddingDate instanceof Timestamp
        ? evData.weddingDate.toDate()
        : new Date(evData.weddingDate as string),
    city: evData.city as string,
    state: (evData.state as string) ?? "",
    country: evData.country as string,
    status: evData.status as WeddingEvent["status"],
    totalGuests: (evData.totalGuests as number) ?? 0,
    rsvpConfirmed: (evData.rsvpConfirmed as number) ?? 0,
    rsvpDeclined: (evData.rsvpDeclined as number) ?? 0,
    rsvpPending: (evData.rsvpPending as number) ?? 0,
    isRsvpOpen: (evData.isRsvpOpen as boolean) ?? true,
    shareCode: (evData.shareCode as string) ?? "",
    coverPhotoURL: evData.coverPhotoURL as string | undefined,
    invitationId: evData.invitationId as string | undefined,
    createdAt:
      evData.createdAt instanceof Timestamp
        ? evData.createdAt.toDate()
        : new Date(),
    updatedAt:
      evData.updatedAt instanceof Timestamp
        ? evData.updatedAt.toDate()
        : new Date(),
  };

  const guest: Guest = {
    guestId: guestSnap.id,
    name: gData.name as string,
    phone: (gData.phone as string) || undefined,
    email: (gData.email as string) || undefined,
    groups: (gData.groups as string[]) ?? [],
    side: (gData.side as Guest["side"]) ?? "mutual",
    invitedFunctions: (gData.invitedFunctions as string[]) ?? [],
    seatCount: (gData.seatCount as number) ?? 1,
    rsvpStatus: (gData.rsvpStatus as Guest["rsvpStatus"]) ?? "pending",
    rsvpUpdatedAt:
      gData.rsvpUpdatedAt instanceof Timestamp
        ? gData.rsvpUpdatedAt.toDate()
        : undefined,
    rsvpToken: (gData.rsvpToken as string) ?? token,
    shareStatus: (gData.shareStatus as Guest["shareStatus"]) ?? "not_sent",
    notes: (gData.notes as string) || undefined,
    addedBy: (gData.addedBy as Guest["addedBy"]) ?? "manual",
    createdAt:
      gData.createdAt instanceof Timestamp
        ? gData.createdAt.toDate()
        : new Date(),
  };

  // Filter functions to only those the guest is invited to
  const invitedFns = fns.filter((f) =>
    guest.invitedFunctions.includes(f.functionId)
  );

  return { guest, event, functions: invitedFns };
}

// ─── RSVP submission ─────────────────────────────────────────────────────────

export type FunctionRsvp = {
  status: "attending" | "not_attending" | "maybe";
  attendeeCount: number;
};

export type SubmitRsvpData = {
  functionResponses: Record<string, FunctionRsvp>;
  dietaryPreference: RSVPResponse["dietaryPreference"];
  dietaryNotes?: string;
  message?: string;
};

function deriveOverallStatus(
  responses: Record<string, FunctionRsvp>
): Guest["rsvpStatus"] {
  const statuses = Object.values(responses).map((r) => r.status);
  if (statuses.some((s) => s === "attending")) return "confirmed";
  if (statuses.every((s) => s === "not_attending")) return "declined";
  return "maybe";
}

export async function submitRsvp(
  eventId: string,
  guestId: string,
  guestName: string,
  guestPhone: string | undefined,
  data: SubmitRsvpData
): Promise<string> {
  const totalAttendees = Object.values(data.functionResponses).reduce(
    (sum, r) => (r.status === "attending" ? sum + r.attendeeCount : sum),
    0
  );

  const ref = await addDoc(
    collection(db, "events", eventId, "rsvps"),
    {
      guestId,
      guestName,
      guestPhone: guestPhone ?? "",
      functionResponses: data.functionResponses,
      totalAttendees,
      dietaryPreference: data.dietaryPreference,
      dietaryNotes: data.dietaryNotes ?? "",
      message: data.message ?? "",
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  // Update the guest's overall RSVP status
  const newStatus = deriveOverallStatus(data.functionResponses);
  await updateDoc(doc(db, "events", eventId, "guests", guestId), {
    rsvpStatus: newStatus,
    rsvpUpdatedAt: serverTimestamp(),
  });

  return ref.id;
}

// ─── Reading RSVPs (host-only, protected area) ────────────────────────────────

function toRsvpResponse(id: string, data: Record<string, unknown>): RSVPResponse {
  return {
    rsvpId: id,
    guestId: data.guestId as string,
    guestName: data.guestName as string,
    guestPhone: (data.guestPhone as string) || undefined,
    functionResponses: (data.functionResponses as RSVPResponse["functionResponses"]) ?? {},
    totalAttendees: (data.totalAttendees as number) ?? 0,
    dietaryPreference: (data.dietaryPreference as RSVPResponse["dietaryPreference"]) ?? "veg",
    dietaryNotes: (data.dietaryNotes as string) || undefined,
    message: (data.message as string) || undefined,
    submittedAt:
      data.submittedAt instanceof Timestamp
        ? data.submittedAt.toDate()
        : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(),
  };
}

export async function getEventRsvps(eventId: string): Promise<RSVPResponse[]> {
  const snap = await getDocs(collection(db, "events", eventId, "rsvps"));
  return snap.docs
    .map((d) => toRsvpResponse(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}
