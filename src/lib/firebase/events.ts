import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import type { WeddingEvent, EventFunction } from "@/types";

// ── helpers ────────────────────────────────────────────────────────────────

function toEvent(id: string, data: DocumentData): WeddingEvent {
  return {
    ...data,
    eventId: id,
    weddingDate: data.weddingDate?.toDate?.() ?? data.weddingDate,
    rsvpDeadline: data.rsvpDeadline?.toDate?.() ?? data.rsvpDeadline,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as WeddingEvent;
}

function toFunction(id: string, data: DocumentData): EventFunction {
  return {
    ...data,
    functionId: id,
    date: data.date?.toDate?.() ?? data.date,
  } as EventFunction;
}

function generateShareCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ── events ─────────────────────────────────────────────────────────────────

export async function createEvent(
  hostId: string,
  data: {
    brideName: string;
    groomName: string;
    weddingDate: Date;
    city: string;
    state: string;
    country: string;
  }
): Promise<string> {
  const shareCode = generateShareCode();
  const ref = await addDoc(collection(db, "events"), {
    hostId,
    title: `${data.brideName} & ${data.groomName}`,
    brideName: data.brideName,
    groomName: data.groomName,
    weddingDate: data.weddingDate,
    city: data.city,
    state: data.state,
    country: data.country || "India",
    coverPhotoURL: "",
    status: "draft",
    invitationId: "",
    totalGuests: 0,
    rsvpConfirmed: 0,
    rsvpDeclined: 0,
    rsvpPending: 0,
    isRsvpOpen: true,
    shareCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Write shareCodes lookup index for public invitation page
  await setDoc(doc(db, "shareCodes", shareCode), { eventId: ref.id });
  return ref.id;
}

export async function getEventByShareCode(shareCode: string): Promise<WeddingEvent | null> {
  const snap = await getDoc(doc(db, "shareCodes", shareCode));
  if (!snap.exists()) return null;
  const { eventId } = snap.data() as { eventId: string };
  return getEvent(eventId);
}

export async function getEvent(eventId: string): Promise<WeddingEvent | null> {
  const snap = await getDoc(doc(db, "events", eventId));
  if (!snap.exists()) return null;
  return toEvent(snap.id, snap.data());
}

export async function getHostEvents(hostId: string): Promise<WeddingEvent[]> {
  const q = query(collection(db, "events"), where("hostId", "==", hostId));
  const snap = await getDocs(q);
  const events = snap.docs.map((d) => toEvent(d.id, d.data()));
  // Client-side sort by createdAt desc (avoids composite index requirement)
  return events.sort(
    (a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()
  );
}

export async function getHostEventsWithStats(hostId: string): Promise<WeddingEvent[]> {
  const events = await getHostEvents(hostId);
  if (events.length === 0) return events;

  // Fetch guests for all events in parallel to compute accurate counts
  const guestSnaps = await Promise.all(
    events.map((e) => getDocs(collection(db, "events", e.eventId, "guests")))
  );

  return events.map((event, i) => {
    let confirmed = 0, declined = 0, pending = 0;
    guestSnaps[i].forEach((d) => {
      const s = (d.data().rsvpStatus as string) ?? "pending";
      if (s === "confirmed") confirmed++;
      else if (s === "declined") declined++;
      else pending++;
    });
    return {
      ...event,
      totalGuests: guestSnaps[i].size,
      rsvpConfirmed: confirmed,
      rsvpDeclined: declined,
      rsvpPending: pending,
    };
  });
}

export async function updateEvent(
  eventId: string,
  data: Partial<Omit<WeddingEvent, "eventId" | "hostId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "events", eventId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, "events", eventId));
}

// ── functions (ceremonies) ─────────────────────────────────────────────────

export async function addFunction(
  eventId: string,
  data: {
    name: string;
    customName?: string;
    date: Date;
    startTime: string;
    endTime?: string;
    venueName: string;
    venueAddress: string;
    venueCity: string;
    dressCode?: string;
    notes?: string;
    order: number;
  }
): Promise<string> {
  const ref = await addDoc(
    collection(db, "events", eventId, "functions"),
    {
      ...data,
      latitude: null,
      longitude: null,
      mapsURL: "",
      rsvpConfirmed: 0,
      rsvpDeclined: 0,
    }
  );
  return ref.id;
}

export async function getEventFunctions(eventId: string): Promise<EventFunction[]> {
  const snap = await getDocs(collection(db, "events", eventId, "functions"));
  const fns = snap.docs.map((d) => toFunction(d.id, d.data()));
  return fns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function updateFunction(
  eventId: string,
  functionId: string,
  data: Partial<EventFunction>
): Promise<void> {
  await updateDoc(doc(db, "events", eventId, "functions", functionId), data);
}

export async function deleteFunction(
  eventId: string,
  functionId: string
): Promise<void> {
  await deleteDoc(doc(db, "events", eventId, "functions", functionId));
}
