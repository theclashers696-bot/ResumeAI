import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[ResumeAI] BETTER_AUTH_SECRET must be set in production. " +
        "Generate one with: openssl rand -base64 32"
    );
  }
  console.warn(
    "[ResumeAI] BETTER_AUTH_SECRET is not set. " +
      "Using an insecure development fallback. " +
      "Set a secure 32+ character secret before deploying."
  );
}

export const auth = betterAuth({
  secret: secret ?? "dev-secret-replace-in-production-min-32-chars!!",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:5000",
    ...(process.env.REPLIT_DEV_DOMAIN ? [`https://${process.env.REPLIT_DEV_DOMAIN}`] : []),
    ...(process.env.REPLIT_DOMAINS
      ? process.env.REPLIT_DOMAINS.split(",").map((domain) => `https://${domain.trim()}`)
      : []),
  ],
});

export type Auth = typeof auth;
