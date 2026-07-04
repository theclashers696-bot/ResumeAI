"use client";

import { useSession, signIn, signOut, signUp } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending } = useSession();

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading: isPending,
    signIn,
    signOut,
    signUp,
  };
}
