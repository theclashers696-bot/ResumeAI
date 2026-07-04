import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  // Server-side: use env var or localhost
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5000";
  }
  // Client-side: always use the current origin so it works on any domain
  return window.location.origin;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
