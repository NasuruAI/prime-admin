import { env } from "./env";

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

/**
 * Server-side fetch to the backend API. Uses the internal base URL so it works
 * inside docker-compose. Parses the unified `{ "error": {...} }` envelope.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${env.serverApiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const envelope = (
      body as { error?: { code?: string; message?: string; details?: unknown } }
    )?.error;
    throw new ApiRequestError({
      status: res.status,
      code: envelope?.code ?? "error",
      message: envelope?.message ?? `Request failed (${res.status})`,
      details: envelope?.details,
    });
  }

  return body as T;
}
