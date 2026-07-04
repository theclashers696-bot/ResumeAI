import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://resumeai.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: [
          "/dashboard",
          "/resumes",
          "/api/",
          "/profile",
          "/settings",
          "/import",
          "/ai-studio",
          "/career",
          "/cover-letters",
          "/design",
          "/search",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
