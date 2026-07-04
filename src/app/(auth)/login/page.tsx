import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ResumeAI account",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
