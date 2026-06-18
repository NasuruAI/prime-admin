import "server-only";

import { cookies } from "next/headers";

import { ApiRequestError, backendFetch } from "./api";
import { ACCESS_COOKIE } from "./auth-cookies";
import type { User } from "@/types/auth";

/**
 * Resolve the current user from the access-token cookie (server-side only).
 *
 * Returns `null` when there's no valid access token. Token *refresh* (which
 * rotates the refresh token and must persist new cookies) happens in
 * `middleware.ts`, where a response is available to write cookies onto — RSC
 * render cannot set cookies, so we deliberately don't refresh here.
 */
export async function getSession(): Promise<User | null> {
  const access = cookies().get(ACCESS_COOKIE)?.value;
  if (!access) return null;

  try {
    return await backendFetch<User>("/auth/me/", {
      headers: { Authorization: `Bearer ${access}` },
    });
  } catch (err) {
    if (
      err instanceof ApiRequestError &&
      (err.status === 401 || err.status === 403)
    ) {
      return null;
    }
    throw err;
  }
}
