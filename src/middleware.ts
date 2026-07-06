import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/worker-login", "/forgot-password", "/api/auth"];

// Define admin-only routes
const adminRoutes = ["/admin"];
// Define worker-only routes
const workerRoutes = ["/worker"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  const isPublicRoute = publicRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith("/api/auth"));
  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));
  const isWorkerRoute = workerRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));

  // If trying to access protected route without auth
  if (!isLoggedIn && !isPublicRoute) {
    // Redirect to appropriate login page based on route
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (isWorkerRoute) {
      return NextResponse.redirect(new URL("/worker-login", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/worker-login")) {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/worker", req.url));
  }

  // Admin trying to access worker routes
  if (isLoggedIn && isWorkerRoute && (userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Worker trying to access admin routes
  if (isLoggedIn && isAdminRoute && userRole === "WORKER") {
    return NextResponse.redirect(new URL("/worker", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"]
};