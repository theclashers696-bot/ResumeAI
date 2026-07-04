"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToastContext } from "@/components/ui/toaster";
import { resumeSchema, type ResumeInput } from "@/lib/validations/resume";

const templates = [
  { id: "modern", label: "Modern", description: "Clean and contemporary design" },
  { id: "classic", label: "Classic", description: "Traditional professional layout" },
  { id: "minimal", label: "Minimal", description: "Simple and focused" },
  { id: "creative", label: "Creative", description: "Stand out with style" },
] as const;

export default function NewResumePage() {
  const router = useRouter();
  const { toast } = useToastContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResumeInput>({
    resolver: zodResolver(resumeSchema),
    defaultValues: { template: "modern", isPublic: false },
  });

  const selectedTemplate = watch("template");

  const onSubmit = async (data: ResumeInput) => {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Failed to create resume",
          description: result.message ?? result.error,
          variant: "error",
        });
        return;
      }

      toast({ title: "Resume created!", variant: "success" });
      router.push(`/resumes/${result.data.id}/edit`);
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">New Resume</h1>
          <p className="mt-1 text-muted-foreground">
            Choose a template and give your resume a name to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
              <CardDescription>Basic information about your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" required>
                  Resume Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer Resume, Marketing Manager CV"
                  error={errors.title?.message}
                  {...register("title")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <textarea
                  id="summary"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="A brief summary of your professional background and goals..."
                  {...register("summary")}
                />
                {errors.summary && (
                  <p className="text-xs text-destructive">{errors.summary.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose Template</CardTitle>
              <CardDescription>Select a design that matches your style</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setValue("template", template.id)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="mb-2 aspect-[3/4] rounded bg-muted" />
                    <p className="text-sm font-medium">{template.label}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Create Resume
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
