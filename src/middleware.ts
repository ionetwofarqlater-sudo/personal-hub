import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (session.user.role !== "admin") return NextResponse.redirect(new URL("/403", req.url));
  }

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"]
};
