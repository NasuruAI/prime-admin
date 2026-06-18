import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { env } from "@/lib/env";

/**
 * Authenticated reverse-proxy to the backend API.
 *
 * The browser can't read the httpOnly access cookie, so authed calls go through
 * here: this handler attaches the access token server-side. It also forwards the
 * browser's cookies (and relays Set-Cookie back) so the Django session — used
 * for *anonymous* (guest) carts — round-trips correctly.
 */
async function forward(
  request: NextRequest,
  path: string[],
): Promise<NextResponse> {
  const access = cookies().get(ACCESS_COOKIE)?.value;
  const target = `${env.serverApiBaseUrl}/${path.join("/")}/${request.nextUrl.search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (access) headers.Authorization = `Bearer ${access}`;
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) headers.cookie = cookieHeader;

  const method = request.method;
  const body = ["GET", "HEAD"].includes(method)
    ? undefined
    : await request.text();

  const res = await fetch(target, { method, headers, body, cache: "no-store" });
  const text = await res.text();
  const out = new NextResponse(text || null, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
  // Relay the backend's session cookie to the browser (guest cart persistence).
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) out.headers.set("set-cookie", setCookie);
  return out;
}

type Ctx = { params: { path: string[] } };

export const GET = (req: NextRequest, { params }: Ctx) =>
  forward(req, params.path);
export const POST = (req: NextRequest, { params }: Ctx) =>
  forward(req, params.path);
export const PATCH = (req: NextRequest, { params }: Ctx) =>
  forward(req, params.path);
export const PUT = (req: NextRequest, { params }: Ctx) =>
  forward(req, params.path);
export const DELETE = (req: NextRequest, { params }: Ctx) =>
  forward(req, params.path);
