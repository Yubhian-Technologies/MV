"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, getAuthErrorMessage } from "@/lib/firebase/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSentEmail(data.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <MailCheck className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900">Check your inbox</p>
          <p className="text-sm text-slate-500">
            We sent a password reset link to{" "}
            <span className="font-medium text-slate-700">{sentEmail}</span>
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Didn&apos;t receive it?{" "}
          <button
            onClick={() => setSubmitted(false)}
            className="text-rose-600 hover:underline"
          >
            Try again
          </button>
        </p>
        <Link
          href="/login"
          className="block text-sm font-medium text-rose-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Enter your registered email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

        <Button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending…
            </span>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
