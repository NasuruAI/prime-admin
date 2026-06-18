import "server-only";

import { cookies } from "next/headers";

import { backendFetch } from "./api";
import { ACCESS_COOKIE } from "./auth-cookies";

/** Server-side authenticated call to the admin API (uses the access cookie). */
export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const access = cookies().get(ACCESS_COOKIE)?.value;
  return backendFetch<T>(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
  });
}
