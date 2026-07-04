import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-bold">ResumeAI</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
