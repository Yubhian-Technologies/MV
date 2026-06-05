import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile } from "./firestore";

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  await createUserProfile(credential.user, { displayName });
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const { creationTime, lastSignInTime } = credential.user.metadata;
  const isNewUser = creationTime === lastSignInTime;

  if (isNewUser) {
    await createUserProfile(credential.user, {
      displayName: credential.user.displayName ?? "",
    });
  }

  return { user: credential.user, isNewUser };
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail(user: User) {
  await sendEmailVerification(user);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function getAuthErrorMessage(code: string): string {
  const errors: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return errors[code] ?? "Something went wrong. Please try again.";
}
