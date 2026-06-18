import { NextResponse } from "next/server";

import { ApiRequestError, backendFetch } from "@/lib/api";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth-cookies";
import type { TokenPair } from "@/types/auth";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  try {
    const tokens = await backendFetch<TokenPair>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const res = NextResponse.json({ user: tokens.user });
    res.cookies.set(ACCESS_COOKIE, tokens.access, accessCookieOptions());
    res.cookies.set(REFRESH_COOKIE, tokens.refresh, refreshCookieOptions());
    return res;
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
