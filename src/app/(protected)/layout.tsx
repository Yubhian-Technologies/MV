"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, isOnboarded, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (isAuthenticated && user && !user.emailVerified) {
      router.replace("/verify-email");
      return;
    }
    if (isAuthenticated && !isOnboarded) {
      router.replace("/setup");
    }
  }, [isAuthenticated, loading, isOnboarded, user, router]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
