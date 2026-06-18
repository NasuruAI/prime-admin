import { UsersAdmin } from "@/features/admin/users-admin";

export const metadata = { title: "Users & roles" };

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Users & roles</h1>
      <UsersAdmin />
    </div>
  );
}
