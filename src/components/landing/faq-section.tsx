"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is ATS and why does it matter?",
    answer:
      "ATS stands for Applicant Tracking System — software companies use to automatically filter resumes before a human reads them. Up to 75% of resumes are rejected by ATS before reaching a recruiter. ResumeAI ensures your resume passes these filters by analyzing keywords, formatting, and structure.",
  },
  {
    question: "How does the AI Resume Generator work?",
    answer:
      "Our AI analyzes your job title, industry, and experience, then suggests powerful bullet points that highlight your impact. It uses large language models trained on thousands of successful resumes. You stay in control — accept, edit, or reject any suggestion.",
  },
  {
    question: "Can I use ResumeAI for free?",
    answer:
      "Yes! Our free plan lets you create up to 3 resumes with basic templates and 5 AI suggestions per month. It's fully functional for most job seekers. Upgrade to Pro for unlimited resumes, premium templates, and unlimited AI power.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. All data is encrypted at rest and in transit using AES-256. We never share or sell your personal information. Your resume data is solely yours, and you can delete it at any time from your account settings.",
  },
  {
    question: "Can I export my resume as a PDF?",
    answer:
      "Yes, all plans include PDF export. Pro users also get DOCX export. Our exports are pixel-perfect — what you see in the editor is exactly what you get in the file. No formatting surprises.",
  },
  {
    question: "Do you support multiple languages?",
    answer:
      "ResumeAI currently supports English, Spanish, French, German, and Portuguese. We're actively adding more languages. The editor, AI suggestions, and templates all adapt to your selected language.",
  },
  {
    question: "What happens to my resume if I cancel my subscription?",
    answer:
      "Your resumes are never deleted. If you downgrade to free, you retain access to your 3 most recent resumes. All your data stays safe, and you can upgrade again anytime to regain full access.",
  },
  {
    question: "Can I use my own template design?",
    answer:
      "Enterprise plan users can upload custom branded templates. Pro users can extensively customize colors, fonts, spacing, and layout within our template engine. Custom design import is on our roadmap for all users.",
  },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "rounded-xl border border-border transition-all",
        open ? "bg-muted/40" : "bg-background"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="pr-4 font-semibold leading-snug">{faq.question}</span>
        <span className="shrink-0">
          {open ? (
            <Minus className="h-4 w-4 text-blue-600" />
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">FAQ</p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about ResumeAI.
          </p>
        </motion.div>

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.question} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
