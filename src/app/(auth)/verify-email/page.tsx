"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail, signOut } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/firebase/config";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const { reset } = useAuthStore();
  const router = useRouter();

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setResending(true);
    try {
      await resendVerificationEmail(user);
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to resend. Please try again in a few minutes.");
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        toast.success("Email verified! Setting up your profile.");
        router.push("/setup");
      } else {
        toast.error("Email not yet verified. Please check your inbox.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    reset();
    router.push("/login");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
          <MailCheck className="h-10 w-10 text-rose-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Check your email</h1>
          <p className="text-slate-500">
            We sent a verification link to your email address. Click the link
            to verify your account and get started.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-rose-600 hover:bg-rose-700"
            onClick={handleCheckVerified}
            disabled={checking}
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking…
              </span>
            ) : (
              "I've verified my email"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full border-slate-200"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending…
              </span>
            ) : (
              "Resend verification email"
            )}
          </Button>
        </div>

        <p className="text-sm text-slate-400">
          Wrong email?{" "}
          <button
            onClick={handleSignOut}
            className="text-rose-600 hover:underline"
          >
            Sign out and use a different account
          </button>
        </p>
      </div>
    </div>
  );
}
