"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl"
      />

      <div className="container relative mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Start building for free today
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your dream job is one
            <br />
            great resume away.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100">
            Join 100,000+ professionals who landed interviews faster with ResumeAI. No credit card
            required. Free forever plan available.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 border-0 bg-white px-10 text-base font-semibold text-blue-700 shadow-xl hover:bg-blue-50"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 px-10 text-base font-medium text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
