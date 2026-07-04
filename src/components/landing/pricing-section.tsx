"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for getting started",
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    featured: false,
    features: [
      "3 resumes",
      "5 AI suggestions / month",
      "Basic templates",
      "PDF export",
      "ATS score (basic)",
      "Public resume link",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 19,
    annualPrice: 12,
    description: "For serious job seekers",
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
    featured: true,
    features: [
      "Unlimited resumes",
      "Unlimited AI suggestions",
      "All 50+ premium templates",
      "PDF + DOCX export",
      "Full ATS score & analysis",
      "AI cover letter generator",
      "Version history (90 days)",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For teams & organizations",
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    featured: false,
    features: [
      "Everything in Pro",
      "Team management",
      "Custom branding",
      "API access",
      "SSO / SAML",
      "Dedicated account manager",
      "Custom templates",
      "SLA & compliance",
    ],
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Pricing
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                !annual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
                annual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Annual
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                Save 35%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 shadow-sm",
                plan.featured
                  ? "border-blue-500 bg-gradient-to-b from-blue-50 to-background shadow-blue-100 ring-1 ring-blue-500/30"
                  : "border-border bg-background"
              )}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="mb-1 text-sm font-semibold text-muted-foreground">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold">
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.annualPrice > 0 && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
                </div>
                {annual && plan.annualPrice > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">Billed annually</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.featured ? "text-blue-600" : "text-green-500"
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.name === "Enterprise" ? "/contact" : "/register"}>
                <Button
                  variant={plan.ctaVariant}
                  size="lg"
                  className={cn(
                    "w-full",
                    plan.featured &&
                      "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
