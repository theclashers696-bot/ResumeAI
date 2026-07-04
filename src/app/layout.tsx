import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ResumeAI — Build Your Perfect Resume",
    template: "%s | ResumeAI",
  },
  description:
    "Create professional, ATS-optimized resumes in minutes with AI-powered suggestions and beautiful templates.",
  keywords: ["resume builder", "AI resume", "CV maker", "professional resume", "ATS resume"],
  authors: [{ name: "ResumeAI" }],
  creator: "ResumeAI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5000",
    title: "ResumeAI — Build Your Perfect Resume",
    description:
      "Create professional, ATS-optimized resumes in minutes with AI-powered suggestions.",
    siteName: "ResumeAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeAI — Build Your Perfect Resume",
    description:
      "Create professional, ATS-optimized resumes in minutes with AI-powered suggestions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "font-sans antialiased")}>
        {/* Providers renders ToastProvider which renders Toaster internally */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
