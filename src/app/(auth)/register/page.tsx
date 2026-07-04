import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your ResumeAI account and start building professional resumes",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
