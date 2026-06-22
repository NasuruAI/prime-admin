import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";
import { getStoreLogoUrl, getStoreName } from "@/lib/config";

export const metadata = { title: "Sign in" };

function initials(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return "ST";
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[1][0]).toUpperCase();
}

export default async function LoginPage() {
  const [storeName, logoUrl] = await Promise.all([
    getStoreName(),
    getStoreLogoUrl(),
  ]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="w-full max-w-sm rounded-xl border border-ink/10 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={storeName}
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-white">
                {initials(storeName)}
              </span>
              <div className="leading-tight">
                <div className="font-display text-lg font-bold text-ink">
                  {storeName}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink/45">
                  Admin
                </div>
              </div>
            </>
          )}
        </div>
        <p className="mb-6 text-sm text-ink/55">
          Sign in with an admin account to manage the store.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
