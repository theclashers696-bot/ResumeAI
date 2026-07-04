import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-xl font-semibold">Page Not Found</p>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
