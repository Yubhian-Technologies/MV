import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./config";
import type { UserProfile } from "@/types";

export async function createUserProfile(
  user: User,
  additionalData: { displayName?: string; phone?: string }
) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      userId: user.uid,
      email: user.email ?? "",
      displayName: additionalData.displayName ?? user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      phone: additionalData.phone ?? user.phoneNumber ?? "",
      role: "host",
      planType: "free",
      language: "en",
      emailVerified: user.emailVerified,
      phoneVerified: false,
      onboardingComplete: false,
      totalEvents: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return userRef;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function completeOnboarding(
  uid: string,
  data: { coupleName: string; phone?: string; language: string }
) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    coupleName: data.coupleName,
    phone: data.phone ?? "",
    language: data.language,
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
}
