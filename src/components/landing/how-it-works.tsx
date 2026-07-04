"use client";

import { motion } from "framer-motion";
import { UserPlus, FileEdit, Sparkles, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create an account",
    description:
      "Sign up for free in seconds. No credit card needed. Your account is ready instantly.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    number: "02",
    icon: FileEdit,
    title: "Build your resume",
    description:
      "Fill in your experience, skills, and education. Our guided editor makes it simple step by step.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Let AI improve it",
    description:
      "Hit the AI Enhance button. Our model rewrites your bullets, fixes grammar, and boosts your ATS score.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    number: "04",
    icon: Share2,
    title: "Download or share",
    description:
      "Export a flawless PDF instantly or share a live link. Apply with confidence — your resume stands out.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            How It Works
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            From blank page to hired
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four simple steps and you&apos;ll have a polished, interview-ready resume.
          </p>
        </motion.div>

        <div className="relative mt-20">
          <div
            aria-hidden
            className="absolute left-1/2 top-10 hidden h-0.5 w-[calc(100%-180px)] -translate-x-1/2 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 lg:block"
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto mb-6 flex flex-col items-center">
                    <div
                      className={`mb-1 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 ${step.bg} ${step.border} shadow-sm`}
                    >
                      <Icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <span className={`text-xs font-bold ${step.color}`}>{step.number}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
