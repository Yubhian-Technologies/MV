"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail, getAuthErrorMessage } from "@/lib/firebase/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { toast } from "sonner";

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-slate-400"}`}>
      {met ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </li>
  );
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      toast.success("Account created! Please verify your email.");
      router.push("/verify-email");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GoogleSignInButton mode="register" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400">or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Full name</Label>
          <Input
            id="displayName"
            placeholder="Your name"
            autoComplete="name"
            {...register("displayName")}
            className={errors.displayName ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.displayName && (
            <p className="text-xs text-red-500">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
            className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Mobile number{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            autoComplete="tel"
            {...register("phone")}
            className={errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              {...register("password")}
              className={errors.password ? "border-red-400 pr-10 focus-visible:ring-red-400" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <ul className="mt-2 space-y-1 pl-1">
              <PasswordRule met={rules.length} label="At least 8 characters" />
              <PasswordRule met={rules.uppercase} label="One uppercase letter" />
              <PasswordRule met={rules.number} label="One number" />
            </ul>
          )}
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account…
            </span>
          ) : (
            "Create free account"
          )}
        </Button>

        <p className="text-center text-xs text-slate-400">
          By registering, you agree to our{" "}
          <Link href="/terms" className="text-rose-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-rose-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
