import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
const protectedRoutes = ["/dashboard", "/resumes", "/profile", "/settings"];

export function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => pathName.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathName.startsWith(route));

  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Optimistic cookie-presence check only — this avoids an unreliable network
  // hop back into the app from within middleware (edge runtime). The actual
  // session is validated server-side (Node runtime) in the protected layouts
  // via `auth.api.getSession`, which redirects if the session is invalid.
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
