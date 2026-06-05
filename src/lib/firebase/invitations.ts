import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Invitation } from "@/types";

function toInvitation(id: string, data: Record<string, unknown>): Invitation {
  return {
    invitationId: id,
    eventId: data.eventId as string,
    hostId: data.hostId as string,
    templateId: data.templateId as string,
    customMessage: (data.customMessage as string) ?? "",
    customTagline: (data.customTagline as string) ?? "",
    language: (data.language as "en" | "hi") ?? "en",
    showVenueMap: (data.showVenueMap as boolean) ?? true,
    showDressCode: (data.showDressCode as boolean) ?? true,
    showRsvpButton: (data.showRsvpButton as boolean) ?? true,
    status: (data.status as "draft" | "published") ?? "draft",
    publishedAt:
      data.publishedAt instanceof Timestamp
        ? data.publishedAt.toDate()
        : undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(),
  };
}

export async function createInvitation(
  hostId: string,
  eventId: string,
  templateId: string
): Promise<string> {
  const ref = await addDoc(collection(db, "invitations"), {
    hostId,
    eventId,
    templateId,
    customMessage: "",
    customTagline: "",
    language: "en",
    showVenueMap: true,
    showDressCode: true,
    showRsvpButton: true,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Also stamp invitationId on the event document
  await updateDoc(doc(db, "events", eventId), {
    invitationId: ref.id,
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function getInvitation(
  invitationId: string
): Promise<Invitation | null> {
  const snap = await getDoc(doc(db, "invitations", invitationId));
  if (!snap.exists()) return null;
  return toInvitation(snap.id, snap.data() as Record<string, unknown>);
}

export async function getEventInvitation(
  eventId: string
): Promise<Invitation | null> {
  const q = query(
    collection(db, "invitations"),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const first = snap.docs[0];
  return toInvitation(first.id, first.data() as Record<string, unknown>);
}

export async function updateInvitation(
  invitationId: string,
  data: Partial<
    Pick<
      Invitation,
      | "templateId"
      | "customMessage"
      | "customTagline"
      | "language"
      | "showVenueMap"
      | "showDressCode"
      | "showRsvpButton"
      | "status"
    >
  >
): Promise<void> {
  await updateDoc(doc(db, "invitations", invitationId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function publishInvitation(invitationId: string): Promise<void> {
  const invSnap = await getDoc(doc(db, "invitations", invitationId));
  if (!invSnap.exists()) return;
  const { eventId } = invSnap.data() as { eventId: string };

  await updateDoc(doc(db, "invitations", invitationId), {
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Activate event so public invitation page can read it
  await updateDoc(doc(db, "events", eventId), {
    status: "active",
    updatedAt: serverTimestamp(),
  });
}
