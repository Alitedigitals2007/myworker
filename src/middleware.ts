import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/worker-login", "/forgot-password", "/api/auth"];

const adminRoutes = ["/admin"];
const workerRoutes = ["/worker"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  const isPublicRoute = publicRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith("/api/auth"));
  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));
  const isWorkerRoute = workerRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));

  if (!isLoggedIn && !isPublicRoute) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (isWorkerRoute) {
      return NextResponse.redirect(new URL("/worker-login", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/worker-login")) {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/worker", req.url));
  }

  if (isLoggedIn && isWorkerRoute && (userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isLoggedIn && isAdminRoute && userRole === "WORKER") {
    return NextResponse.redirect(new URL("/worker", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"]
};