"use client";

import { motion } from "framer-motion";
import { LogOut, Trash2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToastContext } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToastContext();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Feature coming soon",
      description: "Account deletion will be available in the next update.",
      variant: "warning",
    });
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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sign out of all devices</p>
                <p className="text-sm text-muted-foreground">
                  Remove your session from all browsers and devices.
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible actions that affect your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all your data.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
