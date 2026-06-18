"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { adminCall, adminList } from "@/lib/admin-client";

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
};

const ROLES = ["customer", "admin", "supplier"];

const selectCls =
  "h-9 border border-ink/15 bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none";

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setUsers(await adminList<AdminUser>("/accounts/users/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function setRole(id: string, role: string) {
    setError(null);
    try {
      await adminCall(`/accounts/users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    }
  }

  function initials(u: AdminUser) {
    const s = (u.full_name || u.email).trim();
    return s.slice(0, 2).toUpperCase();
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Banner tone="error">{error}</Banner>}

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {users.map((u) => (
              <tr key={u.id} className="transition hover:bg-ink/[0.015]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                      {initials(u)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">
                        {u.email}
                      </div>
                      <div className="truncate text-xs text-ink/50">
                        {u.full_name || "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.is_active ? "success" : "danger"}>
                    {u.is_active ? "active" : "inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value)}
                      className={selectCls}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
