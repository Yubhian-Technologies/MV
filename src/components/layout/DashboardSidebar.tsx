"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarHeart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Share2,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/useAuth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarHeart },
  { label: "Templates", href: "/templates", icon: Sparkles },
  { label: "Guests", href: "/guests", icon: Users },
  { label: "Share", href: "/share", icon: Share2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { reset } = useAuthStore();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      reset();
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const initials = (profile?.displayName ?? user?.displayName ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-100 bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Logo size="sm" href="/dashboard" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-rose-50 text-rose-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-rose-600" : "text-slate-400"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? ""} />
            <AvatarFallback className="bg-rose-100 text-rose-700 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {profile?.displayName ?? user?.displayName ?? ""}
            </p>
            <p className="truncate text-xs text-slate-500">{profile?.planType ?? "free"} plan</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 transition-colors hover:text-rose-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
