"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, isOnboarded, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect away if authenticated AND email verified.
    // Authenticated-but-unverified users must stay on /verify-email.
    if (!loading && isAuthenticated && user?.emailVerified) {
      router.replace(isOnboarded ? "/dashboard" : "/setup");
    }
  }, [isAuthenticated, loading, isOnboarded, router]);

  if (loading) return <LoadingSpinner fullPage />;
  // Authenticated + verified users are redirected — block render while that happens
  if (isAuthenticated && user?.emailVerified) return null;

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-gradient-to-br from-rose-600 via-rose-500 to-pink-400 p-12 text-white">
        <Logo className="text-white [&_span]:text-white" size="lg" />
        <div className="flex flex-1 flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Your Love Story,
              <br />
              Beautifully Invited
            </h1>
            <p className="text-lg text-rose-100">
              Create stunning digital wedding invitations, manage your guests,
              and collect RSVPs — all in one beautiful place.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "✓ Beautiful South Asian & modern templates",
              "✓ Real-time RSVP tracking",
              "✓ WhatsApp-first sharing",
              "✓ Multi-function event management",
            ].map((item) => (
              <p key={item} className="text-rose-50">
                {item}
              </p>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
              💍
            </div>
            <div>
              <p className="font-medium">"Arjun & Priya invited 400 guests"</p>
              <p className="text-sm text-rose-200">
                92% RSVP rate in 48 hours with MarriageVerse
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
