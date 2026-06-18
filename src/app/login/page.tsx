import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="w-full max-w-sm border border-ink/10 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center bg-accent font-display text-sm font-bold text-white">
            IC
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-ink">
              IdealCommerce
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink/45">
              Admin
            </div>
          </div>
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
