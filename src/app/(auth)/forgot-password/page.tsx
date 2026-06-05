import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your MarriageVerse password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Forgot password?</h1>
        <p className="text-slate-500">No worries — we&apos;ll send you a reset link.</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
