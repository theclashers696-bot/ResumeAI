"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToastContext } from "@/components/ui/toaster";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToastContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        toast({
          title: "Registration failed",
          description: result.error.message ?? "Could not create account.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to ResumeAI. Let's build your first resume.",
        variant: "success",
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Start building your perfect resume today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                autoComplete="name"
                {...register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                autoComplete="email"
                {...register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="new-password"
                {...register("password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
