"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

export function DashboardWelcome() {
  const { profile, user } = useAuth();
  const name =
    profile?.displayName?.split(" ")[0] ??
    user?.displayName?.split(" ")[0] ??
    "there";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Hello, {name}! 👋
          </h1>
          {profile?.planType === "free" && (
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 text-xs"
            >
              Free Plan
            </Badge>
          )}
          {profile?.planType === "premium" && (
            <Badge className="bg-rose-600 text-white text-xs hover:bg-rose-600">
              Premium
            </Badge>
          )}
        </div>
        <p className="text-slate-500">
          {profile?.coupleName
            ? `Managing invitations for ${profile.coupleName}`
            : "Manage your wedding invitations from here."}
        </p>
      </div>
      <Link
        href="/events/create/details"
        className={cn(
          buttonVariants({ variant: "default" }),
          "w-fit bg-rose-600 hover:bg-rose-700"
        )}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Event
      </Link>
    </div>
  );
}
