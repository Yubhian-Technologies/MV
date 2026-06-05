import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free MarriageVerse account.",
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500">
          Start building your dream wedding invitation for free.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
