import { UsersAdmin } from "@/features/admin/users-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Users & roles" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Users & roles"
      />
      <UsersAdmin />
    </div>
  );
}
