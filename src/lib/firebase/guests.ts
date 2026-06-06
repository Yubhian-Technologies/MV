import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Guest } from "@/types";

function guestsCol(eventId: string) {
  return collection(db, "events", eventId, "guests");
}

function guestDoc(eventId: string, guestId: string) {
  return doc(db, "events", eventId, "guests", guestId);
}

function eventDoc(eventId: string) {
  return doc(db, "events", eventId);
}

function generateRsvpToken(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

function toGuest(id: string, data: Record<string, unknown>): Guest {
  return {
    guestId: id,
    name: data.name as string,
    phone: (data.phone as string) || undefined,
    email: (data.email as string) || undefined,
    groups: (data.groups as string[]) ?? [],
    side: (data.side as Guest["side"]) ?? "mutual",
    invitedFunctions: (data.invitedFunctions as string[]) ?? [],
    seatCount: (data.seatCount as number) ?? 1,
    rsvpStatus: (data.rsvpStatus as Guest["rsvpStatus"]) ?? "pending",
    rsvpUpdatedAt:
      data.rsvpUpdatedAt instanceof Timestamp
        ? data.rsvpUpdatedAt.toDate()
        : undefined,
    rsvpToken: (data.rsvpToken as string) ?? "",
    shareStatus: (data.shareStatus as Guest["shareStatus"]) ?? "not_sent",
    sharedAt:
      data.sharedAt instanceof Timestamp
        ? data.sharedAt.toDate()
        : undefined,
    sharedVia: data.sharedVia as Guest["sharedVia"],
    notes: (data.notes as string) || undefined,
    addedBy: (data.addedBy as Guest["addedBy"]) ?? "manual",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(),
  };
}

export type AddGuestData = {
  name: string;
  phone?: string;
  email?: string;
  side: Guest["side"];
  invitedFunctions: string[];
  seatCount: number;
  notes?: string;
  groups?: string[];
};

export async function addGuest(
  eventId: string,
  data: AddGuestData
): Promise<{ guestId: string; rsvpToken: string }> {
  const token = generateRsvpToken();

  const ref = await addDoc(guestsCol(eventId), {
    name: data.name.trim(),
    phone: data.phone?.trim() ?? "",
    email: data.email?.trim() ?? "",
    groups: data.groups ?? [],
    side: data.side,
    invitedFunctions: data.invitedFunctions,
    seatCount: data.seatCount,
    rsvpStatus: "pending",
    rsvpToken: token,
    shareStatus: "not_sent",
    notes: data.notes?.trim() ?? "",
    addedBy: "manual",
    createdAt: serverTimestamp(),
  });

  // Write token → { eventId, guestId } index for public RSVP page lookup
  await setDoc(doc(db, "rsvpTokens", token), {
    eventId,
    guestId: ref.id,
  });

  await updateDoc(eventDoc(eventId), {
    totalGuests: increment(1),
    rsvpPending: increment(1),
    updatedAt: serverTimestamp(),
  });

  return { guestId: ref.id, rsvpToken: token };
}

export async function getGuests(eventId: string): Promise<Guest[]> {
  const snap = await getDocs(guestsCol(eventId));
  const guests = snap.docs.map((d) =>
    toGuest(d.id, d.data() as Record<string, unknown>)
  );
  return guests.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGuest(
  eventId: string,
  guestId: string
): Promise<Guest | null> {
  const snap = await getDoc(guestDoc(eventId, guestId));
  if (!snap.exists()) return null;
  return toGuest(snap.id, snap.data() as Record<string, unknown>);
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  data: Partial<AddGuestData>
): Promise<void> {
  await updateDoc(guestDoc(eventId, guestId), {
    ...data,
    ...(data.name ? { name: data.name.trim() } : {}),
    ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
    ...(data.notes !== undefined ? { notes: data.notes.trim() } : {}),
  });
}

export async function updateGuestRsvp(
  eventId: string,
  guestId: string,
  newStatus: Guest["rsvpStatus"],
  oldStatus: Guest["rsvpStatus"]
): Promise<void> {
  await updateDoc(guestDoc(eventId, guestId), {
    rsvpStatus: newStatus,
    rsvpUpdatedAt: serverTimestamp(),
  });

  // Adjust event-level RSVP counters
  const counterMap: Record<Guest["rsvpStatus"], "rsvpConfirmed" | "rsvpDeclined" | "rsvpPending"> = {
    confirmed: "rsvpConfirmed",
    declined: "rsvpDeclined",
    pending: "rsvpPending",
    maybe: "rsvpPending", // treat "maybe" as pending for counter purposes
  };

  await updateDoc(eventDoc(eventId), {
    [counterMap[oldStatus]]: increment(-1),
    [counterMap[newStatus]]: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGuest(
  eventId: string,
  guest: Pick<Guest, "guestId" | "rsvpStatus">
): Promise<void> {
  await deleteDoc(guestDoc(eventId, guest.guestId));

  const counterMap: Record<Guest["rsvpStatus"], string> = {
    confirmed: "rsvpConfirmed",
    declined: "rsvpDeclined",
    pending: "rsvpPending",
    maybe: "rsvpPending",
  };

  await updateDoc(eventDoc(eventId), {
    totalGuests: increment(-1),
    [counterMap[guest.rsvpStatus]]: increment(-1),
    updatedAt: serverTimestamp(),
  });
}
