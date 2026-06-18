import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { backendFetch } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";

export async function POST() {
  const jar = cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;

  // Best-effort blacklist of the refresh token on the backend.
  if (refresh && access) {
    try {
      await backendFetch("/auth/logout/", {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Ignore — we clear cookies regardless so the client is logged out locally.
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}
