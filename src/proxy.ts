import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

export async function proxy(request: NextRequest) {
  const { data: session } = await betterFetch<any>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const isAuthPage = request.nextUrl.pathname == "/login";
  const isProtectedRoute =
    request.nextUrl.pathname == "/" ||
    request.nextUrl.pathname.startsWith("/api/scrape");

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/api/scrape"],
};
