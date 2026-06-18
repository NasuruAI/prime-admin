"use client";

/** Client-side admin API via the authed proxy (admin Bearer token attached server-side). */
export async function adminCall<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/proxy/admin${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (body as { error?: { message?: string } })?.error?.message ??
        `Request failed (${res.status})`,
    );
  }
  return body as T;
}

/** Paginated list helper that tolerates both paginated and bare-array responses. */
export async function adminList<T = unknown>(path: string): Promise<T[]> {
  const data = await adminCall<{ results?: T[] } | T[]>(path);
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}
