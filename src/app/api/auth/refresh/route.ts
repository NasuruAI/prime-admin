import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ApiRequestError, backendFetch } from "@/lib/api";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth-cookies";

/**
 * Exchange the refresh-token cookie for a new access token (and, with rotation
 * enabled on the backend, a new refresh token). Persists both as fresh cookies.
 */
export async function POST() {
  const refresh = cookies().get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const tokens = await backendFetch<{ access: string; refresh?: string }>(
      "/auth/refresh/",
      {
        method: "POST",
        body: JSON.stringify({ refresh }),
      },
    );
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, tokens.access, accessCookieOptions());
    if (tokens.refresh) {
      res.cookies.set(REFRESH_COOKIE, tokens.refresh, refreshCookieOptions());
    }
    return res;
  } catch (err) {
    const status = err instanceof ApiRequestError ? err.status : 500;
    const res = NextResponse.json({ error: "Session expired." }, { status });
    // Clear stale cookies so the client falls back to the login page.
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }
}
