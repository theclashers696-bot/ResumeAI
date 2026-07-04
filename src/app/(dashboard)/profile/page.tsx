"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Globe, Phone, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToastContext } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToastContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      const result = await res.json();
      if (result.data) {
        reset({
          name: user?.name ?? "",
          headline: result.data.headline ?? "",
          bio: result.data.bio ?? "",
          location: result.data.location ?? "",
          website: result.data.website ?? "",
          linkedin: result.data.linkedin ?? "",
          github: result.data.github ?? "",
          phone: result.data.phone ?? "",
        });
      }
    }
    fetchProfile();
  }, [user?.name, reset]);

  const onSubmit = async (data: ProfileInput) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({ title: "Failed to update profile", description: result.error, variant: "error" });
        return;
      }

      toast({ title: "Profile updated!", variant: "success" });
      reset(data);
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
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your personal information and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar src={user?.image} name={user?.name ?? ""} size="xl" />
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <Input
                  id="name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                  {...register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g., Senior Software Engineer at Google"
                  error={errors.headline?.message}
                  {...register("headline")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Tell us about yourself..."
                  {...register("bio")}
                />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    error={errors.location?.message}
                    {...register("location")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  leftIcon={<Globe className="h-4 w-4" />}
                  error={errors.website?.message}
                  {...register("website")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  leftIcon={<Linkedin className="h-4 w-4" />}
                  error={errors.linkedin?.message}
                  {...register("linkedin")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/yourusername"
                  leftIcon={<Github className="h-4 w-4" />}
                  error={errors.github?.message}
                  {...register("github")}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  );
}
