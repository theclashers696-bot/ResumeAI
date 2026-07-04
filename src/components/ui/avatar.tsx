import * as React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-8 w-8", text: "text-xs" },
  md: { container: "h-10 w-10", text: "text-sm" },
  lg: { container: "h-12 w-12", text: "text-base" },
  xl: { container: "h-16 w-16", text: "text-xl" },
};

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const { container, text } = sizeMap[size];

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", container, className)}>
        <Image
          src={src}
          alt={alt ?? name ?? "Avatar"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 64px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground",
        container,
        text,
        className
      )}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
}

export { Avatar };
