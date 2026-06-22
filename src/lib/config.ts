import "server-only";

import { cache } from "react";

import { backendFetch } from "./api";

const FALLBACK_NAME = "IdealCommerce";

/**
 * The admin-managed store name (storeconfig `store.name`), so the admin
 * back-office is branded the same as the storefront. Cached per request;
 * falls back to a default if the API is unreachable.
 */
export const getStoreName = cache(async (): Promise<string> => {
  try {
    const data = await backendFetch<{ settings: Record<string, unknown> }>(
      "/config/",
    );
    const name = data.settings?.["store.name"];
    return typeof name === "string" && name ? name : FALLBACK_NAME;
  } catch {
    return FALLBACK_NAME;
  }
});

/** Delivery URL of the admin-uploaded store logo (or "" to use the wordmark). */
export const getStoreLogoUrl = cache(async (): Promise<string> => {
  try {
    const data = await backendFetch<{ settings: Record<string, unknown> }>(
      "/config/",
    );
    const id = data.settings?.["store.logo_public_id"];
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
    return typeof id === "string" && id && cloud
      ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,h_64/${id}`
      : "";
  } catch {
    return "";
  }
});

/** Admin-set brand colours, so the back-office matches the storefront theme. */
export const getStoreBrand = cache(
  async (): Promise<{ primary: string; accent: string }> => {
    const fallback = { primary: "#6E0D25", accent: "#C9184A" };
    try {
      const data = await backendFetch<{ settings: Record<string, unknown> }>(
        "/config/",
      );
      const s = data.settings ?? {};
      const pick = (key: string, fb: string) =>
        typeof s[key] === "string" && s[key] ? (s[key] as string) : fb;
      return {
        primary: pick("branding.primary_color", fallback.primary),
        accent: pick("branding.accent_color", fallback.accent),
      };
    } catch {
      return fallback;
    }
  },
);
