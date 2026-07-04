"use client";

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toaster";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
