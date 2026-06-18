/**
 * Centralised, validated access to public environment configuration.
 * Server-only secrets must never be read here (this module is client-safe).
 */
export const env = {
  /** Base URL the browser uses to reach the API. */
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  /**
   * Base URL the Next.js server (route handlers, RSC, middleware) uses to reach
   * the API. Inside docker-compose this is the internal service name; falls back
   * to the public URL for local `next dev`.
   */
  serverApiBaseUrl:
    process.env.API_INTERNAL_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000/api/v1",
} as const;
