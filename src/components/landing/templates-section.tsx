"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
  {
    name: "Modern",
    category: "Tech & Engineering",
    color: "from-blue-500 to-indigo-600",
    accent: "#3b82f6",
    sections: ["Experience", "Skills", "Projects"],
  },
  {
    name: "Executive",
    category: "Leadership & Management",
    color: "from-slate-700 to-slate-900",
    accent: "#334155",
    sections: ["Summary", "Experience", "Education"],
  },
  {
    name: "Creative",
    category: "Design & Marketing",
    color: "from-purple-500 to-pink-600",
    accent: "#a855f7",
    sections: ["Portfolio", "Skills", "Awards"],
  },
  {
    name: "Minimal",
    category: "Finance & Consulting",
    color: "from-teal-500 to-emerald-600",
    accent: "#14b8a6",
    sections: ["Experience", "Education", "Certifications"],
  },
];

function TemplateCard({ template, index }: { template: (typeof templates)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-background shadow-sm hover:shadow-2xl"
    >
      <div className={`relative h-56 bg-gradient-to-br ${template.color} p-5`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <div className="h-4 w-4 rounded-sm bg-white/80" />
          </div>
          <div className="mb-2 h-2 w-24 rounded-full bg-white/80" />
          <div className="mb-4 h-1.5 w-16 rounded-full bg-white/50" />
          {template.sections.map((section, i) => (
            <div key={section} className="mb-3">
              <div className="mb-1.5 h-1 w-12 rounded-full bg-white/60" />
              <div className="space-y-1">
                <div
                  className="h-1 rounded-full bg-white/30"
                  style={{ width: `${80 - i * 8}%` }}
                />
                <div
                  className="h-1 rounded-full bg-white/20"
                  style={{ width: `${65 - i * 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-foreground shadow-lg">
            Preview Template
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{template.name}</p>
            <p className="text-xs text-muted-foreground">{template.category}</p>
          </div>
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: template.accent }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function TemplatesSection() {
  return (
    <section id="templates" className="bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Templates
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Designed to get you noticed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            50+ professionally crafted templates. Each one is ATS-tested, recruiter-approved, and
            fully customizable.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template, i) => (
            <TemplateCard key={template.name} template={template} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link href="/register">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              Browse All Templates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
