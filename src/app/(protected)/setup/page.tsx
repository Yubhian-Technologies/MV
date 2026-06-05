"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarHeart, Globe, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/Logo";
import { completeOnboarding } from "@/lib/firebase/firestore";
import { profileSetupSchema, type ProfileSetupInput } from "@/lib/validations/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { getUserProfile } from "@/lib/firebase/firestore";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { value: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
] as const;

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { setProfile } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { language: "en" },
  });

  const selectedLanguage = watch("language");
  const coupleName = watch("coupleName");

  const onSubmit = async (data: ProfileSetupInput) => {
    if (!user) return;
    setLoading(true);
    try {
      await completeOnboarding(user.uid, {
        coupleName: data.coupleName,
        phone: data.phone || "",
        language: data.language,
      });
      const updatedProfile = await getUserProfile(user.uid);
      setProfile(updatedProfile);
      toast.success("Profile set up! Let's create your first invitation.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Couple Names", icon: CalendarHeart },
    { label: "Contact", icon: Phone },
    { label: "Language", icon: Globe },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" size="lg" />
          <p className="mt-3 text-slate-500">
            Welcome! Let&apos;s set up your profile in 3 quick steps.
          </p>
        </div>

        {/* Step progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            {steps.map(({ label, icon: Icon }, i) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  i + 1 <= step ? "text-rose-600" : "text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
          <p className="mt-2 text-right text-xs text-slate-400">
            Step {step} of 3
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            {/* Step 1: Couple Names */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    What&apos;s the couple&apos;s name?
                  </h2>
                  <p className="text-sm text-slate-500">
                    This will appear on all your invitations.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coupleName">Couple names</Label>
                  <Input
                    id="coupleName"
                    placeholder="e.g., Arjun & Priya"
                    {...register("coupleName")}
                    className={errors.coupleName ? "border-red-400" : ""}
                  />
                  {errors.coupleName && (
                    <p className="text-xs text-red-500">
                      {errors.coupleName.message}
                    </p>
                  )}
                  {coupleName && !errors.coupleName && (
                    <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-widest">
                        Preview
                      </p>
                      <p className="mt-1 text-lg font-bold text-rose-700">
                        {coupleName}
                      </p>
                      <p className="text-xs text-slate-500">
                        are getting married!
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  onClick={() => {
                    if (!coupleName || errors.coupleName) return;
                    setStep(2);
                  }}
                  disabled={!coupleName}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Add your mobile number
                  </h2>
                  <p className="text-sm text-slate-500">
                    Used for WhatsApp notifications and account recovery.
                    Completely optional.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Mobile number{" "}
                    <span className="font-normal text-slate-400">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <span className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit number"
                      {...register("phone")}
                      className={errors.phone ? "border-red-400" : ""}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-rose-600 hover:bg-rose-700"
                    onClick={() => setStep(3)}
                  >
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Language */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Choose your language
                  </h2>
                  <p className="text-sm text-slate-500">
                    We&apos;ll show templates and interface in your preferred language.
                  </p>
                </div>

                <div className="space-y-2">
                  {LANGUAGES.map(({ value, label, flag }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("language", value)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        selectedLanguage === value
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-2xl">{flag}</span>
                      <span className="font-medium">{label}</span>
                      {selectedLanguage === value && (
                        <span className="ml-auto text-rose-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Setting up…
                      </span>
                    ) : (
                      "Complete Setup 🎉"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
