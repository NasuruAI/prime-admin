import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth-cookies";
import { env } from "@/lib/env";

// The whole admin app is gated to the `admin` role. Only /login is public.
function decodeClaims(jwt: string): { exp?: number; role?: string } {
  try {
    const [, payload] = jwt.split(".");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return {};
  }
}

function isExpired(jwt: string): boolean {
  const { exp } = decodeClaims(jwt);
  if (!exp) return true;
  return exp * 1000 <= Date.now() + 10_000;
}

function loginRedirect(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  const res = NextResponse.redirect(url);
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const response = NextResponse.next();

  if (!access || isExpired(access)) {
    if (!refresh) return loginRedirect(request);
    try {
      const apiRes = await fetch(`${env.serverApiBaseUrl}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!apiRes.ok) return loginRedirect(request);
      const data = (await apiRes.json()) as {
        access: string;
        refresh?: string;
      };
      access = data.access;
      response.cookies.set(ACCESS_COOKIE, data.access, accessCookieOptions());
      if (data.refresh) {
        response.cookies.set(
          REFRESH_COOKIE,
          data.refresh,
          refreshCookieOptions(),
        );
      }
    } catch {
      return loginRedirect(request);
    }
  }

  if (decodeClaims(access).role !== "admin") {
    // Authenticated but not an admin — send to login (which shows the error).
    return loginRedirect(request);
  }

  return response;
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
