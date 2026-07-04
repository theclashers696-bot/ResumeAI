"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const trustItems = ["No credit card required", "Free forever plan", "Cancel anytime"];

function ResumeCard() {
  return (
    <div className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg">
          J
        </div>
        <div>
          <p className="font-semibold text-foreground">Jordan Mitchell</p>
          <p className="text-xs text-muted-foreground">Senior Product Designer</p>
        </div>
        <div className="ml-auto rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          98% ATS
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Experience
        </p>
        <div className="space-y-3">
          {[
            { role: "Lead Designer", co: "Stripe Inc.", years: "2021–Present" },
            { role: "UI Designer", co: "Vercel", years: "2019–2021" },
          ].map((job) => (
            <div key={job.co} className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium">{job.role}</p>
                <p className="text-[11px] text-muted-foreground">{job.co}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">{job.years}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {["Figma", "React", "TypeScript", "User Research", "Prototyping"].map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: "0%" }}
          animate={{ width: "98%" }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-muted-foreground">ATS Score: 98/100</p>

      <div className="absolute -right-3 -top-3 rounded-xl border border-border bg-background px-3 py-1.5 shadow-lg">
        <p className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
          <CheckCircle className="h-3 w-3" /> AI Enhanced
        </p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-background to-background" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp} className="mb-6 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Resume Builder
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  NEW
                </span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Create{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ATS-friendly
              </span>{" "}
              resumes powered by AI.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
            >
              Stop getting filtered out. Build a professional resume in minutes with AI
              suggestions, real-time ATS scoring, and beautiful templates trusted by 100K+
              professionals.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-base font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-base">
                  <Play className="h-4 w-4 fill-current" />
                  Live Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              {trustItems.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl" />
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ResumeCard />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-6 -left-10 rounded-xl border border-border bg-background px-4 py-3 shadow-xl"
              >
                <p className="text-xs text-muted-foreground">Responses in</p>
                <p className="text-lg font-bold text-foreground">2× faster</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-8 top-20 rounded-xl border border-border bg-background px-4 py-3 shadow-xl"
              >
                <p className="text-[11px] text-muted-foreground">Interviews landed</p>
                <p className="text-lg font-bold text-green-600">+87%</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
