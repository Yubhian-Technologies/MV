"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Globe2,
  LogOut,
  Shield,
  Sparkles,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/firestore";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";
import { toast } from "sonner";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[+\d\s\-()]{7,20}$/.test(v), "Enter a valid phone number"),
  language: z.enum(["en", "hi", "ta"]),
});

type ProfileInput = z.infer<typeof profileSchema>;

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-rose-500" />
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { reset } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", phone: "", language: "en" },
  });

  const language = watch("language");

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid)
      .then((p) => {
        if (p) {
          setProfile(p);
          resetForm({
            displayName: p.displayName ?? "",
            phone: p.phone ?? "",
            language: (p.language as "en" | "hi" | "ta") ?? "en",
          });
        }
      })
      .catch(() => toast.error("Could not load profile."))
      .finally(() => setLoading(false));
  }, [user, resetForm]);

  const onSave = async (data: ProfileInput) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        phone: data.phone ?? "",
        language: data.language,
      });
      setProfile((prev) => prev ? { ...prev, ...data } : prev);
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      reset();
      router.push("/login");
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage your profile and account preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile section */}
        <SectionCard title="Profile" icon={User}>
          <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
            {/* Display name */}
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Full name</Label>
              <Input
                id="displayName"
                placeholder="Your name"
                {...register("displayName")}
                className={errors.displayName ? "border-red-400" : ""}
              />
              {errors.displayName && (
                <p className="text-xs text-red-500">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email — read-only */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email
              </Label>
              <Input
                value={profile?.email ?? user?.email ?? ""}
                readOnly
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email cannot be changed here.</p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Phone <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                {...register("phone")}
                className={errors.phone ? "border-red-400" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Language preference */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                Preferred language
              </Label>
              <div className="flex gap-2">
                {(["en", "hi", "ta"] as const).map((lang) => {
                  const labels = { en: "English", hi: "हिंदी", ta: "தமிழ்" };
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setValue("language", lang, { shouldDirty: true })}
                      className={cn(
                        "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
                        language === lang
                          ? "border-rose-400 bg-rose-50 text-rose-700"
                          : "border-slate-200 text-slate-600 hover:border-rose-200"
                      )}
                    >
                      {labels[lang]}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700"
              disabled={saving || !isDirty}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </SectionCard>

        {/* Plan section */}
        <SectionCard title="Plan" icon={Sparkles}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 capitalize">
                {profile?.planType ?? "free"} plan
              </p>
              <p className="text-sm text-slate-500">
                {profile?.planType === "free"
                  ? "Upgrade to unlock premium templates, unlimited guests, and priority support."
                  : "You have access to all premium features."}
              </p>
            </div>
            {profile?.planType === "free" && (
              <Button className="shrink-0 bg-violet-600 hover:bg-violet-700 ml-4">
                Upgrade
              </Button>
            )}
          </div>
        </SectionCard>

        {/* Account section */}
        <SectionCard title="Account" icon={Shield}>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Sign out</p>
                <p className="text-xs text-slate-500">Sign out of this device</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                className="shrink-0 border-slate-200 text-slate-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-red-800">Delete account</p>
                <p className="text-xs text-red-600">Permanently remove your data. This cannot be undone.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled
                className="shrink-0 border-red-200 text-red-600 opacity-60 cursor-not-allowed"
              >
                Delete
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
