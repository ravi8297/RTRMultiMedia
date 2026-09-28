import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function middlewareAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users trying to access protected routes
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Protect admin-only routes
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (pathname.startsWith("/admin") && token && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Protect student-only routes (routes students can access)
  if (pathname.startsWith("/profile") || pathname.startsWith("/my-courses") || pathname.startsWith("/my-learning") || pathname.startsWith("/progress")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (token?.role !== "student") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Redirect authenticated users from login/register
  if (pathname.startsWith("/auth/login") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/auth/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}