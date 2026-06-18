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
