"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: "SC",
    color: "from-blue-500 to-indigo-500",
    rating: 5,
    text: "ResumeAI completely transformed my job search. The AI suggestions turned my bland bullet points into impactful statements. I got 3 interviews in the first week.",
  },
  {
    name: "Marcus Williams",
    role: "Product Manager",
    company: "Stripe",
    avatar: "MW",
    color: "from-purple-500 to-pink-500",
    rating: 5,
    text: "The ATS score feature is a game-changer. I went from zero callbacks to 5 interviews in two weeks after optimizing my resume. Absolutely worth it.",
  },
  {
    name: "Priya Patel",
    role: "UX Designer",
    company: "Figma",
    avatar: "PP",
    color: "from-orange-500 to-amber-500",
    rating: 5,
    text: "Beautiful templates that actually stand out. The creative template got compliments from every recruiter I spoke to. Landed my dream job at Figma!",
  },
  {
    name: "James Rodriguez",
    role: "Data Scientist",
    company: "OpenAI",
    avatar: "JR",
    color: "from-teal-500 to-emerald-500",
    rating: 5,
    text: "I was skeptical about AI-generated content, but the suggestions were surprisingly good and human-sounding. Saved me hours of writing. 10/10 would recommend.",
  },
  {
    name: "Aisha Johnson",
    role: "Marketing Director",
    company: "Notion",
    avatar: "AJ",
    color: "from-rose-500 to-red-500",
    rating: 5,
    text: "The cover letter generator is incredible. I customized cover letters for 20 different jobs in one afternoon. My response rate jumped from 5% to 40%.",
  },
  {
    name: "Kevin Park",
    role: "Full-Stack Developer",
    company: "Vercel",
    avatar: "KP",
    color: "from-cyan-500 to-blue-500",
    rating: 5,
    text: "Clean, fast, and incredibly smart. The version history feature saved me when I accidentally deleted a whole section. Best resume tool I've ever used.",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Testimonials
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Loved by job seekers worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join 100,000+ professionals who landed their dream jobs with ResumeAI.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
