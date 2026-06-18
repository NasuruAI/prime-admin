/**
 * Cookie names + options for the auth tokens.
 *
 * Tokens are stored in **httpOnly** cookies so JavaScript can never read them
 * (mitigates XSS token theft). They are set/cleared only by server route
 * handlers and middleware.
 */
export const ACCESS_COOKIE = "ic_access";
export const REFRESH_COOKIE = "ic_refresh";

const isProd = process.env.NODE_ENV === "production";

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
};

// Lifetimes mirror the backend SIMPLE_JWT settings (15 min access / 7 day refresh).
export const accessCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 15,
});

export const refreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
