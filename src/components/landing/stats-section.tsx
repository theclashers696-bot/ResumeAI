"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 100000, suffix: "+", label: "Resumes Created", prefix: "" },
  { value: 98, suffix: "%", label: "ATS Compatibility Rate", prefix: "" },
  { value: 50, suffix: "+", label: "Countries Reached", prefix: "" },
  { value: 4.9, suffix: "★", label: "Average User Rating", prefix: "" },
];

function AnimatedNumber({
  value,
  suffix,
  prefix,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  prefix: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 15 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent =
          prefix +
          (decimals > 0
            ? latest.toFixed(decimals)
            : Math.floor(latest).toLocaleString()) +
          suffix;
      }
    });
  }, [spring, suffix, prefix, decimals]);

  return <span ref={ref}>{prefix + "0" + suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-blue-100">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
