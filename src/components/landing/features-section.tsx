"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  Mail,
  Layout,
  Download,
  Share2,
  Save,
  History,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Resume Generator",
    description:
      "Describe your experience in plain text. Our AI transforms it into polished, impactful bullet points tailored to your target role.",
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
  },
  {
    icon: BarChart3,
    title: "ATS Score Checker",
    description:
      "Get an instant compatibility score. We analyze your resume against real ATS algorithms so you never get filtered out again.",
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
  },
  {
    icon: Mail,
    title: "AI Cover Letter",
    description:
      "Generate personalized, compelling cover letters for any job posting in seconds. Customize tone, length, and style.",
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
  },
  {
    icon: Layout,
    title: "Resume Templates",
    description:
      "50+ recruiter-approved templates designed by experts. From tech to creative, find the perfect layout for your field.",
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
  },
  {
    icon: Download,
    title: "PDF Export",
    description:
      "Export pixel-perfect PDFs in one click. Every template is print-ready and renders beautifully across all devices.",
    gradient: "from-red-500 to-rose-500",
    bg: "bg-red-50",
  },
  {
    icon: Share2,
    title: "Resume Sharing",
    description:
      "Share your live resume with a unique URL. Recruiters can view your latest version — no attachments needed.",
    gradient: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
  },
  {
    icon: Save,
    title: "Auto Save",
    description:
      "Never lose your work. Changes are saved to the cloud in real-time as you type, from any device, anywhere.",
    gradient: "from-teal-500 to-green-500",
    bg: "bg-teal-50",
  },
  {
    icon: History,
    title: "Version History",
    description:
      "Made a mistake? Restore any previous version with one click. Full history with named snapshots and timestamps.",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Features
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything you need to get hired
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit for the modern job search. From AI writing to smart tracking — we
            have you covered.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center bg-gradient-to-br ${feature.gradient} rounded-lg`}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold leading-tight">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                <div
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${feature.gradient} scale-x-0 transition-transform duration-300 group-hover:scale-x-100`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
