import Link from "next/link";
import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#templates", label: "Templates" },
    { href: "/#faq", label: "FAQ" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  Resources: [
    { href: "/docs", label: "Documentation" },
    { href: "/changelog", label: "Changelog" },
    { href: "/status", label: "System Status" },
    { href: "/support", label: "Support" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/security", label: "Security" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">ResumeAI</span>
            </Link>
            <p className="mt-3 max-w-[180px] text-sm leading-relaxed text-muted-foreground">
              Build professional resumes that land interviews. AI-powered, ATS-optimized.
            </p>
            <div className="mt-5 flex gap-3">
              {["𝕏", "in", "gh"].map((icon) => (
                <div
                  key={icon}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ResumeAI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
